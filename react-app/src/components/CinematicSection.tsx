import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SITE_CONTENT } from '../data/content';
import { CinematicStage } from '../types';
import { FrameCacheManager, FrameEngineConfig } from '../lib/frameEngine';
import { HeroOverlay } from './HeroOverlay';
import { CinematicHud } from './CinematicHud';

interface CinematicSectionProps {
  onInitialReady: () => void;
  onBufferProgress: (percent: number) => void;
}

const CONFIG: FrameEngineConfig = {
  totalFrames: SITE_CONTENT.cinematic.totalFrames || 960,
  framePath: (index: number) => `/frames/frame-${String(index).padStart(4, '0')}.jpg`,
  maxCacheSize: 140,
  concurrencyLimit: 8,
  keyframeStep: 16,
  preloadAhead: 30,
  preloadBehind: 12,
  lerpFactor: 0.22,
  maxDPR: 2.0,
};

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  onInitialReady,
  onBufferProgress,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheManagerRef = useRef<FrameCacheManager | null>(null);

  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [activeStage, setActiveStage] = useState<CinematicStage>(
    SITE_CONTENT.cinematic.stages[0]
  );
  const [progressPercent, setProgressPercent] = useState<number>(0);

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

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
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
    const total = CONFIG.totalFrames;
    const percent = Math.min(
      100,
      Math.round(((frameIndex - 1) / (total - 1)) * 100)
    );

    setCurrentFrame(frameIndex);
    setProgressPercent(percent);

    const stages = SITE_CONTENT.cinematic.stages;
    const active =
      stages.find((s) => frameIndex >= s.frameStart && frameIndex <= s.frameEnd) ||
      stages[0];
    setActiveStage(active);
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
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    if (lastDrawnFrameRef.current >= 1) {
      drawToCanvas(lastDrawnFrameRef.current);
    }
  }, [drawToCanvas]);

  const onScroll = useCallback(() => {
    const section = sectionRef.current;
    const cacheManager = cacheManagerRef.current;
    if (!section || !cacheManager) return;

    const now = performance.now();
    const currentY = window.scrollY || window.pageYOffset || 0;
    const deltaY = currentY - lastScrollYRef.current;
    const deltaTime = Math.max(1, now - lastScrollTimeRef.current);

    const scrollVelocity = Math.abs(deltaY / deltaTime);
    const scrollDirection = deltaY >= 0 ? 1 : -1;
    lastScrollYRef.current = currentY;
    lastScrollTimeRef.current = now;

    const scrollableDistance = section.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const progress = Math.min(Math.max(currentY / scrollableDistance, 0), 1);
    const target = 1 + Math.round(progress * (CONFIG.totalFrames - 1));
    targetFrameIndexRef.current = target;

    cacheManager.requestFrames(target, scrollDirection, scrollVelocity);
  }, []);

  const onFrameLoaded = useCallback((loadedIndex: number) => {
    const currentRender = Math.round(currentFrameFloatRef.current);
    const currentDist = Math.abs(currentlyDrawnSourceIndexRef.current - currentRender);
    const newDist = Math.abs(loadedIndex - currentRender);

    if (newDist < currentDist || loadedIndex === currentRender) {
      needsRepaintRef.current = true;
    }
  }, []);

  useEffect(() => {
    const cacheManager = new FrameCacheManager(
      CONFIG,
      (loadedIndex) => onFrameLoaded(loadedIndex),
      (percent) => onBufferProgress(percent)
    );
    cacheManagerRef.current = cacheManager;

    resizeCanvas();
    onScroll();

    cacheManager.preloadInitialSequence(() => {
      renderFrame(targetFrameIndexRef.current);
      onInitialReady();
    });

    const renderLoop = () => {
      const diff = targetFrameIndexRef.current - currentFrameFloatRef.current;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.005) {
        const dynamicFactor = Math.min(0.5, CONFIG.lerpFactor + absDiff * 0.006);
        currentFrameFloatRef.current += diff * dynamicFactor;
      } else {
        currentFrameFloatRef.current = targetFrameIndexRef.current;
      }

      const frameToDraw = Math.round(currentFrameFloatRef.current);

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
    };
  }, [resizeCanvas, onScroll, onFrameLoaded, onBufferProgress, onInitialReady, renderFrame]);

  const isHeroVisible = currentFrame <= 35;
  const isHudActive = currentFrame > 35;

  return (
    <section id="cinematic-section" ref={sectionRef}>
      <div id="cinematic-sticky">
        {/* Canvas Element */}
        <canvas id="cinematic-canvas" ref={canvasRef} />

        {/* Cinematic Vignette */}
        <div className="cinematic-vignette" />

        {/* Technical Corner Marks */}
        <div className="cinematic-grid">
          <div className="grid-corner grid-tl" />
          <div className="grid-corner grid-tr" />
          <div className="grid-corner grid-bl" />
          <div className="grid-corner grid-br" />
        </div>

        {/* Opening Hero Overlay */}
        <HeroOverlay isVisible={isHeroVisible} />

        {/* Cinematic HUD */}
        <CinematicHud
          isActive={isHudActive}
          frameIndex={currentFrame}
          totalFrames={CONFIG.totalFrames}
          progressPercent={progressPercent}
          activeStage={activeStage}
        />
      </div>
    </section>
  );
};
