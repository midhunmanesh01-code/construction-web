import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SITE_CONTENT } from '../data/content';
import { CinematicStage } from '../types';
import { FrameCacheManager, FrameEngineConfig } from '../lib/frameEngine';
import { HeroOverlay } from './HeroOverlay';
import { CinematicHud } from './CinematicHud';
import { MobileHero } from './MobileHero';

interface CinematicSectionProps {
  onInitialReady: () => void;
  onBufferProgress: (percent: number) => void;
}

const DESKTOP_FRAME_BASE_URL =
  (import.meta.env.VITE_FRAME_BASE_URL as string) ||
  SITE_CONTENT.cinematic.frameBaseUrl ||
  '/frames';

const MOBILE_BREAKPOINT = 768;

const DESKTOP_CONFIG: FrameEngineConfig = {
  totalFrames: SITE_CONTENT.cinematic.totalFrames || 960,
  framePath: (index: number) =>
    `${DESKTOP_FRAME_BASE_URL.replace(/\/+$/, '')}/frame-${String(index).padStart(4, '0')}.jpg`,
  maxCacheSize: 320,
  concurrencyLimit: 8,
  keyframeStep: 16,
  preloadAhead: 45,
  preloadBehind: 20,
  lerpFactor: 0.12,
  maxDPR: 2.0,
};

const getIsMobile = () =>
  typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  onInitialReady,
  onBufferProgress,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile());
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cacheManagerRef = useRef<FrameCacheManager | null>(null);

  // Resize handler to reactively switch between mobile static hero and desktop canvas
  useEffect(() => {
    const handleResize = () => {
      const mobile = getIsMobile();
      setIsMobile((prev) => (prev !== mobile ? mobile : prev));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For mobile mode: notify preloader immediately and complete smoothly
  useEffect(() => {
    if (isMobile) {
      onBufferProgress(100);
      const timer = setTimeout(() => {
        onInitialReady();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isMobile, onBufferProgress, onInitialReady]);

  // Discrete state for desktop cinematic HUD/Hero transitions
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(true);
  const [activeStage, setActiveStage] = useState<CinematicStage>(
    SITE_CONTENT.cinematic.stages[0]
  );
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const activeStageIdRef = useRef<string>(SITE_CONTENT.cinematic.stages[0].id);
  const isHeroVisibleRef = useRef<boolean>(true);
  const lastProgressPercentRef = useRef<number>(0);

  const currentFrameFloatRef = useRef<number>(1.0);
  const targetFrameIndexRef = useRef<number>(1);
  const lastDrawnFrameRef = useRef<number>(0);
  const currentlyDrawnSourceIndexRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(performance.now());
  const needsRepaintRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);

  const drawToCanvas = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const cacheManager = cacheManagerRef.current;
    if (!canvas || !cacheManager) return;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { img, sourceIndex } = cacheManager.getNearestFrame(frameIndex);
    if (!img) return;

    currentlyDrawnSourceIndexRef.current = sourceIndex;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = 'naturalWidth' in img ? img.naturalWidth : (img as ImageBitmap).width;
    const ih = 'naturalHeight' in img ? img.naturalHeight : (img as ImageBitmap).height;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = Math.ceil(iw * scale);
    const dh = Math.ceil(ih * scale);
    const dx = Math.round((cw - dw) * 0.5);
    const dy = Math.round((ch - dh) * 0.5);

    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  const updateHUD = useCallback((frameIndex: number) => {
    const total = DESKTOP_CONFIG.totalFrames;
    const percent = Math.min(
      100,
      Math.round(((frameIndex - 1) / (total - 1)) * 100)
    );

    if (percent !== lastProgressPercentRef.current) {
      lastProgressPercentRef.current = percent;
      setProgressPercent(percent);
    }

    const heroBoundary = 45;
    const heroShouldBeVisible = frameIndex <= heroBoundary;
    if (heroShouldBeVisible !== isHeroVisibleRef.current) {
      isHeroVisibleRef.current = heroShouldBeVisible;
      setIsHeroVisible(heroShouldBeVisible);
    }

    const stages = SITE_CONTENT.cinematic.stages;
    const active =
      stages.find((s) => frameIndex >= s.frameStart && frameIndex <= s.frameEnd) ||
      stages[0];

    if (active.id !== activeStageIdRef.current) {
      activeStageIdRef.current = active.id;
      setActiveStage(active);
    }
  }, []);

  const renderFrame = useCallback(
    (frameIndex: number) => {
      drawToCanvas(frameIndex);
      updateHUD(frameIndex);
      lastDrawnFrameRef.current = frameIndex;
    },
    [drawToCanvas, updateHUD]
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMobile) return;

    const dpr = Math.min(window.devicePixelRatio || 1, DESKTOP_CONFIG.maxDPR);
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (ctxRef.current) {
      ctxRef.current.imageSmoothingEnabled = true;
      ctxRef.current.imageSmoothingQuality = 'high';
    }

    if (lastDrawnFrameRef.current >= 1) {
      drawToCanvas(lastDrawnFrameRef.current);
    }
  }, [drawToCanvas, isMobile]);

  const onScroll = useCallback(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    const cacheManager = cacheManagerRef.current;
    if (!section || !cacheManager) return;

    const rect = section.getBoundingClientRect();
    const scrollableDistance = section.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const currentY = -rect.top;
    const rawProgress = Math.min(Math.max(currentY / scrollableDistance, 0), 1);

    const now = performance.now();
    const deltaY = currentY - lastScrollYRef.current;
    const deltaTime = Math.max(1, now - lastScrollTimeRef.current);

    const scrollVelocity = Math.abs(deltaY / deltaTime);
    const scrollDirection = deltaY >= 0 ? 1 : -1;
    lastScrollYRef.current = currentY;
    lastScrollTimeRef.current = now;

    const totalFrames = DESKTOP_CONFIG.totalFrames;
    const target = 1 + rawProgress * (totalFrames - 1);
    targetFrameIndexRef.current = target;

    cacheManager.requestFrames(Math.round(target), scrollDirection, scrollVelocity);
  }, [isMobile]);

  const onFrameLoaded = useCallback((loadedIndex: number) => {
    const currentRender = Math.round(currentFrameFloatRef.current);
    const currentDist = Math.abs(currentlyDrawnSourceIndexRef.current - currentRender);
    const newDist = Math.abs(loadedIndex - currentRender);

    if (newDist < currentDist || loadedIndex === currentRender) {
      needsRepaintRef.current = true;
    }
  }, []);

  // Desktop canvas & frame engine initialization
  useEffect(() => {
    if (isMobile) return;

    const cacheManager = new FrameCacheManager(
      DESKTOP_CONFIG,
      (loadedIndex) => onFrameLoaded(loadedIndex),
      (percent) => onBufferProgress(percent)
    );
    cacheManagerRef.current = cacheManager;

    resizeCanvas();
    onScroll();

    cacheManager.preloadInitialSequence(() => {
      renderFrame(Math.round(targetFrameIndexRef.current));
      onInitialReady();
    });

    let lastFrameTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const dt = Math.min(Math.max((currentTime - lastFrameTime) / 1000, 0.001), 0.1);
      lastFrameTime = currentTime;

      const diff = targetFrameIndexRef.current - currentFrameFloatRef.current;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.001) {
        const smoothing = 1 - Math.exp(-9 * dt);
        currentFrameFloatRef.current += diff * smoothing;
      } else {
        currentFrameFloatRef.current = targetFrameIndexRef.current;
      }

      const frameToDraw = Math.min(
        DESKTOP_CONFIG.totalFrames,
        Math.max(1, Math.round(currentFrameFloatRef.current))
      );

      if (frameToDraw !== lastDrawnFrameRef.current || needsRepaintRef.current) {
        renderFrame(frameToDraw);
        needsRepaintRef.current = false;
      }

      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', onScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      cacheManager.destroy();
      cacheManagerRef.current = null;
    };
  }, [isMobile, resizeCanvas, onScroll, onFrameLoaded, onBufferProgress, onInitialReady, renderFrame]);

  if (isMobile) {
    return (
      <section id="cinematic-section" className="mobile-static-mode" ref={sectionRef}>
        <MobileHero />
      </section>
    );
  }

  return (
    <section id="cinematic-section" ref={sectionRef}>
      <div id="cinematic-sticky">
        <canvas id="cinematic-canvas" ref={canvasRef} />
        <div className="cinematic-vignette" />
        <div className="cinematic-grid">
          <div className="grid-corner grid-tl" />
          <div className="grid-corner grid-tr" />
          <div className="grid-corner grid-bl" />
          <div className="grid-corner grid-br" />
        </div>
        <HeroOverlay isVisible={isHeroVisible} />
        <CinematicHud
          isActive={!isHeroVisible}
          progressPercent={progressPercent}
          activeStage={activeStage}
        />
      </div>
    </section>
  );
};
