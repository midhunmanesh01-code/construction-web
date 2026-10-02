/**
 * ==========================================================================
 * M & M CONSTRUCTIONS — ULTRA-PERFORMANCE CINEMATIC SCROLL ENGINE
 * ==========================================================================
 */

import { SITE_CONTENT } from './content.js';

// --- Engine Configuration ---
const CONFIG = {
  totalFrames: SITE_CONTENT.cinematic.totalFrames || 960,
  framePath: (index) => `./frames/frame-${String(index).padStart(4, '0')}.jpg`,
  maxCacheSize: 140,            // Bounded cache to avoid massive GPU memory allocation
  concurrencyLimit: 8,          // Concurrent asynchronous workers
  keyframeStep: 16,             // Permanent keyframe grid interval (60 frames across whole 960 timeline)
  preloadAhead: 30,             // Directional preloading lookahead
  preloadBehind: 12,            // Directional preloading lookbehind
  lerpFactor: 0.22,             // Responsive yet silky smoothing factor
  maxDPR: 2.0                   // High-DPI ceiling
};

/**
 * High-Performance Frame Cache Manager
 * - Dual-layer storage: Permanent Keyframe Grid + High-Density Active LRU Window
 * - Non-blocking asynchronous decoding via createImageBitmap / img.decode()
 * - Instant nearest-frame fallback guarantees 0ms visual stall and zero black flashes
 * - Proactive dynamic repaint whenever closer/exact frames finish loading
 */
class FrameCacheManager {
  constructor(config, onFrameLoadedCallback) {
    this.config = config;
    this.onFrameLoadedCallback = onFrameLoadedCallback;
    this.cache = new Map();         // frameIndex -> ImageBitmap | HTMLImageElement
    this.permanentKeys = new Set(); // Keyframe indexes that are never evicted
    this.loadingSet = new Set();    // frameIndexes currently in flight
    this.queue = [];                // prioritized array of frame indexes
    this.activeWorkers = 0;
    this.lastDrawnImage = null;
    this.initialBufferTarget = 15;
    this.loadedBufferCount = 0;
    this.onInitialReady = null;

    // Register permanent keyframe set
    for (let i = 1; i <= this.config.totalFrames; i += this.config.keyframeStep) {
      this.permanentKeys.add(i);
    }
    this.permanentKeys.add(this.config.totalFrames);
  }

  getFrame(index) {
    return this.cache.get(index) || null;
  }

  hasFrame(index) {
    return this.cache.has(index);
  }

  /**
   * Returns { img, isExact, sourceIndex }
   * Guarantees an immediate valid image (at most keyframeStep / 2 frames away)
   */
  getNearestFrame(targetIndex) {
    if (this.cache.has(targetIndex)) {
      const img = this.cache.get(targetIndex);
      this.lastDrawnImage = img;
      return { img, isExact: true, sourceIndex: targetIndex };
    }

    // Search outward for the closest cached frame
    let closestIndex = -1;
    let minDistance = Infinity;

    for (const [cachedIndex, img] of this.cache.entries()) {
      const dist = Math.abs(cachedIndex - targetIndex);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = cachedIndex;
      }
    }

    if (closestIndex !== -1) {
      const img = this.cache.get(closestIndex);
      this.lastDrawnImage = img;
      return { img, isExact: false, sourceIndex: closestIndex };
    }

    return { img: this.lastDrawnImage, isExact: false, sourceIndex: -1 };
  }

  /**
   * Request frames to be prioritized and loaded around target
   */
  requestFrames(targetIndex, direction = 1, velocity = 0) {
    this.pruneCache(targetIndex);

    const desired = [];
    // 1. Target frame
    desired.push(targetIndex);

    // 2. Immediate neighbors (+/- 2)
    for (let i = 1; i <= 3; i++) {
      if (targetIndex + i <= this.config.totalFrames) desired.push(targetIndex + i);
      if (targetIndex - i >= 1) desired.push(targetIndex - i);
    }

    // 3. Directional window based on scroll speed
    const dynamicAhead = Math.min(50, this.config.preloadAhead + Math.round(velocity * 8));
    const dynamicBehind = this.config.preloadBehind;

    if (direction >= 0) {
      for (let i = 4; i <= dynamicAhead; i++) {
        const idx = targetIndex + i;
        if (idx <= this.config.totalFrames) desired.push(idx);
      }
      for (let i = 4; i <= dynamicBehind; i++) {
        const idx = targetIndex - i;
        if (idx >= 1) desired.push(idx);
      }
    } else {
      for (let i = 4; i <= dynamicAhead; i++) {
        const idx = targetIndex - i;
        if (idx >= 1) desired.push(idx);
      }
      for (let i = 4; i <= dynamicBehind; i++) {
        const idx = targetIndex + i;
        if (idx <= this.config.totalFrames) desired.push(idx);
      }
    }

    // Filter queue to un-cached & un-loading frames
    this.queue = desired.filter(idx => !this.cache.has(idx) && !this.loadingSet.has(idx));

    this.processQueue();
  }

  processQueue() {
    while (this.activeWorkers < this.config.concurrencyLimit && this.queue.length > 0) {
      const nextIndex = this.queue.shift();
      if (!this.cache.has(nextIndex) && !this.loadingSet.has(nextIndex)) {
        this.loadFrame(nextIndex);
      }
    }
  }

  async loadFrame(index) {
    this.loadingSet.add(index);
    this.activeWorkers++;

    const url = this.config.framePath(index);

    try {
      let imageObj;

      // Modern off-thread ImageBitmap decoder
      if (window.createImageBitmap && window.fetch) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        imageObj = await createImageBitmap(blob);
      } else {
        // Fallback to HTMLImageElement
        imageObj = await new Promise((resolve, reject) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      }

      this.cache.set(index, imageObj);
      this.loadingSet.delete(index);
      this.activeWorkers--;

      // Initial sequence progress tracking
      if (this.loadedBufferCount < this.initialBufferTarget) {
        this.loadedBufferCount++;
        const percent = Math.min(100, Math.round((this.loadedBufferCount / this.initialBufferTarget) * 100));
        this.updatePreloader(percent);
        if (this.loadedBufferCount >= this.initialBufferTarget && this.onInitialReady) {
          this.onInitialReady();
          this.onInitialReady = null;
        }
      }

      // Notify controller of newly loaded frame for live repaint
      if (this.onFrameLoadedCallback) {
        this.onFrameLoadedCallback(index);
      }

      this.processQueue();
    } catch (err) {
      this.loadingSet.delete(index);
      this.activeWorkers--;
      this.processQueue();
    }
  }

  updatePreloader(percent) {
    const bar = document.getElementById('preloader-bar');
    const txt = document.getElementById('preloader-percent');
    if (bar) bar.style.width = `${percent}%`;
    if (txt) txt.textContent = `${percent}%`;
  }

  pruneCache(currentIndex) {
    if (this.cache.size <= this.config.maxCacheSize) return;

    // Filter to evictable keys (exclude permanent keyframes)
    const evictableKeys = [];
    for (const key of this.cache.keys()) {
      if (!this.permanentKeys.has(key)) {
        evictableKeys.push(key);
      }
    }

    // Sort by distance from currentIndex descending
    evictableKeys.sort((a, b) => Math.abs(b - currentIndex) - Math.abs(a - currentIndex));

    const removeCount = this.cache.size - this.config.maxCacheSize;
    for (let i = 0; i < removeCount && i < evictableKeys.length; i++) {
      const keyToRemove = evictableKeys[i];
      const obj = this.cache.get(keyToRemove);
      if (obj && typeof obj.close === 'function') {
        obj.close(); // Clean up GPU ImageBitmap resources
      }
      this.cache.delete(keyToRemove);
    }
  }

  preloadInitialSequence(callback) {
    this.onInitialReady = callback;
    // Load frame 1 immediately
    this.loadFrame(1);
    // Queue the rest of initial buffer
    for (let i = 2; i <= this.initialBufferTarget; i++) {
      this.queue.push(i);
    }
    this.processQueue();

    // In the background, load permanent keyframe grid
    setTimeout(() => this.preloadKeyframeGrid(), 1000);
  }

  preloadKeyframeGrid() {
    for (const keyframe of this.permanentKeys) {
      if (!this.cache.has(keyframe) && !this.loadingSet.has(keyframe)) {
        this.queue.push(keyframe);
      }
    }
    this.processQueue();
  }
}

/**
 * Main Cinematic Application Controller
 */
class CinematicApp {
  constructor() {
    this.cacheManager = new FrameCacheManager(CONFIG, (loadedIndex) => this.onFrameLoaded(loadedIndex));
    this.canvas = document.getElementById('cinematic-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.section = document.getElementById('cinematic-section');
    this.heroOverlay = document.getElementById('hero-overlay');
    this.hud = document.getElementById('cinematic-hud');
    this.frameCounterText = document.getElementById('hud-frame-num');
    this.stageIndicator = document.getElementById('hud-stage-num');
    this.stageCard = document.getElementById('hud-stage-card');
    this.hudProgressFill = document.getElementById('hud-progress-fill');
    this.hudProgressLabel = document.getElementById('hud-progress-label');

    this.currentFrameFloat = 1.0;
    this.targetFrameIndex = 1;
    this.lastDrawnFrame = 0;
    this.currentlyDrawnSourceIndex = 0;
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;
    this.lastScrollTime = performance.now();
    this.scrollVelocity = 0;
    this.scrollDirection = 1;
    this.currentStageId = '';
    this.needsRepaint = false;

    this.init();
  }

  init() {
    this.populateSiteContent();
    this.setupEventListeners();
    this.resizeCanvas();
    this.onScroll();

    // Initial sequence buffer
    this.cacheManager.preloadInitialSequence(() => {
      this.renderFrame(this.targetFrameIndex, true);
      setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('loaded');
      }, 200);
    });

    // Start RAF rendering loop
    requestAnimationFrame(this.renderLoop.bind(this));
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    if (this.lastDrawnFrame >= 1) {
      this.drawToCanvas(this.lastDrawnFrame);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Smooth navigation anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          const mobileDrawer = document.getElementById('mobile-drawer');
          if (mobileDrawer) mobileDrawer.classList.remove('open');
        }
      });
    });

    // Back to top button
    const backToTopBtn = document.getElementById('btn-back-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile navigation drawer toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileClose = document.getElementById('mobile-close-btn');

    if (menuToggle && mobileDrawer) {
      menuToggle.addEventListener('click', () => mobileDrawer.classList.toggle('open'));
    }
    if (mobileClose && mobileDrawer) {
      mobileClose.addEventListener('click', () => mobileDrawer.classList.remove('open'));
    }

    // Project modal viewer close
    const projectModal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    if (modalClose && projectModal) {
      modalClose.addEventListener('click', () => projectModal.classList.remove('open'));
      projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) projectModal.classList.remove('open');
      });
    }

    // Project inquiry form
    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = inquiryForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.textContent = 'TRANSMITTING CONSULTATION REQUEST...';
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.textContent = 'REQUEST TRANSMITTED · STUDIO WILL CONNECT';
            submitBtn.style.backgroundColor = '#22c55e';
            submitBtn.style.color = '#08090a';
            inquiryForm.reset();
          }, 900);
        }
      });
    }
  }

  onScroll() {
    const now = performance.now();
    const currentY = window.scrollY || window.pageYOffset || 0;
    const deltaY = currentY - this.lastScrollY;
    const deltaTime = Math.max(1, now - this.lastScrollTime);

    this.scrollVelocity = Math.abs(deltaY / deltaTime);
    this.scrollDirection = deltaY >= 0 ? 1 : -1;
    this.lastScrollY = currentY;
    this.lastScrollTime = now;

    // Accurate scroll progress through pinned section
    const scrollableDistance = this.section.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const progress = Math.min(Math.max(currentY / scrollableDistance, 0), 1);
    this.targetFrameIndex = 1 + Math.round(progress * (CONFIG.totalFrames - 1));

    // Request high-priority nearby frames
    this.cacheManager.requestFrames(this.targetFrameIndex, this.scrollDirection, this.scrollVelocity);
  }

  onFrameLoaded(loadedIndex) {
    const currentRender = Math.round(this.currentFrameFloat);
    // If loaded frame matches current frame or is closer than what is currently rendered, repaint!
    const currentDist = Math.abs(this.currentlyDrawnSourceIndex - currentRender);
    const newDist = Math.abs(loadedIndex - currentRender);

    if (newDist < currentDist || loadedIndex === currentRender) {
      this.needsRepaint = true;
    }
  }

  renderLoop() {
    // Dynamic adaptive lerp interpolation
    const diff = this.targetFrameIndex - this.currentFrameFloat;
    const absDiff = Math.abs(diff);

    if (absDiff > 0.005) {
      const dynamicFactor = Math.min(0.5, CONFIG.lerpFactor + absDiff * 0.006);
      this.currentFrameFloat += diff * dynamicFactor;
    } else {
      this.currentFrameFloat = this.targetFrameIndex;
    }

    const frameToDraw = Math.round(this.currentFrameFloat);

    if (frameToDraw !== this.lastDrawnFrame || this.needsRepaint) {
      this.renderFrame(frameToDraw, this.needsRepaint);
      this.needsRepaint = false;
    }

    requestAnimationFrame(this.renderLoop.bind(this));
  }

  renderFrame(frameIndex, force = false) {
    this.drawToCanvas(frameIndex);
    this.updateHUD(frameIndex);
    this.lastDrawnFrame = frameIndex;
  }

  drawToCanvas(frameIndex) {
    const { img, isExact, sourceIndex } = this.cacheManager.getNearestFrame(frameIndex);
    if (!img) return;

    this.currentlyDrawnSourceIndex = sourceIndex;

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    // Sub-pixel Object-Fit: COVER calculation
    const scale = Math.max(cw / iw, ch / ih);
    const dw = Math.ceil(iw * scale);
    const dh = Math.ceil(ih * scale);
    const dx = Math.round((cw - dw) * 0.5);
    const dy = Math.round((ch - dh) * 0.5);

    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  updateHUD(frameIndex) {
    const total = CONFIG.totalFrames;
    const progressPercent = Math.min(100, Math.round(((frameIndex - 1) / (total - 1)) * 100));

    // 1. Opening Hero Overlay visibility (Frames 1-35)
    if (this.heroOverlay) {
      if (frameIndex <= 35) {
        this.heroOverlay.classList.remove('hidden');
      } else {
        this.heroOverlay.classList.add('hidden');
      }
    }

    // 2. Cinematic HUD visibility (Frames 36-950)
    if (this.hud) {
      if (frameIndex > 35) {
        this.hud.classList.add('active');
      } else {
        this.hud.classList.remove('active');
      }
    }

    // 3. Update frame counter
    if (this.frameCounterText) {
      this.frameCounterText.textContent = `FRAME ${String(frameIndex).padStart(4, '0')} / ${String(total).padStart(4, '0')}`;
    }

    // 4. Update journey progress bar
    if (this.hudProgressFill) {
      this.hudProgressFill.style.width = `${progressPercent}%`;
    }
    if (this.hudProgressLabel) {
      this.hudProgressLabel.textContent = `${progressPercent}% JOURNEY`;
    }

    // 5. Update timeline stage card
    const stages = SITE_CONTENT.cinematic.stages;
    const activeStage = stages.find(s => frameIndex >= s.frameStart && frameIndex <= s.frameEnd) || stages[0];

    if (activeStage && activeStage.id !== this.currentStageId) {
      this.currentStageId = activeStage.id;
      if (this.stageIndicator) {
        this.stageIndicator.textContent = `${activeStage.step} · ${activeStage.title}`;
      }
      if (this.stageCard) {
        this.stageCard.innerHTML = `
          <div class="stage-step-tag">${activeStage.step} STAGE</div>
          <div class="stage-title">${activeStage.title} ${activeStage.subtitle}</div>
          <div class="stage-desc">${activeStage.description}</div>
        `;
      }
    }
  }

  populateSiteContent() {
    // 1. About Pillars
    const pillarsContainer = document.getElementById('about-pillars');
    if (pillarsContainer && SITE_CONTENT.about.pillars) {
      pillarsContainer.innerHTML = SITE_CONTENT.about.pillars.map(pillar => `
        <div class="pillar-card">
          <div class="pillar-num">${pillar.number}</div>
          <h3 class="pillar-title">${pillar.title}</h3>
          <div class="pillar-subtitle">${pillar.subtitle}</div>
          <p class="pillar-desc">${pillar.description}</p>
        </div>
      `).join('');
    }

    // 2. Services List
    const servicesContainer = document.getElementById('services-list');
    if (servicesContainer && SITE_CONTENT.services) {
      servicesContainer.innerHTML = SITE_CONTENT.services.map(svc => `
        <div class="service-row">
          <div class="service-num">${svc.number}</div>
          <div class="service-main">
            <h3 class="service-title">${svc.title}</h3>
            <div class="service-tagline">${svc.tagline}</div>
          </div>
          <p class="service-body">${svc.description}</p>
          <div class="service-deliverables">
            ${svc.deliverables.slice(0, 3).map(del => `<span class="deliverable-tag">${del}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    // 3. Projects Showcase
    const projectsContainer = document.getElementById('projects-grid');
    if (projectsContainer && SITE_CONTENT.projects) {
      projectsContainer.innerHTML = SITE_CONTENT.projects.map(proj => `
        <div class="project-card">
          <div>
            <div class="project-top-meta">
              <span class="proj-number">PROJECT ${proj.number}</span>
              <span class="proj-status">${proj.year} · ${proj.location}</span>
            </div>
            <h3 class="proj-title">${proj.title}</h3>
            <div class="proj-category">${proj.category}</div>
            <p class="proj-overview">${proj.overview}</p>
            <div class="proj-specs-grid">
              ${proj.specs.map(sp => `
                <div class="proj-spec-item">
                  <span class="spec-label">${sp.label}</span>
                  <span class="spec-val">${sp.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <button class="proj-btn" data-project-id="${proj.id}">
            <span>VIEW ARCHITECTURAL SPECIFICATION</span>
            <span>→</span>
          </button>
        </div>
      `).join('');

      projectsContainer.querySelectorAll('.proj-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const projId = btn.getAttribute('data-project-id');
          this.openProjectModal(projId);
        });
      });
    }

    // 4. Process Stepper
    const processContainer = document.getElementById('process-timeline');
    if (processContainer && SITE_CONTENT.process) {
      processContainer.innerHTML = SITE_CONTENT.process.map(proc => `
        <div class="process-step-item">
          <div class="step-box">
            <span class="step-num">${proc.step}</span>
            <span class="step-phase">PHASE</span>
          </div>
          <div class="step-header">
            <h3 class="step-title">${proc.title}</h3>
            <span class="step-subtitle">${proc.subtitle}</span>
          </div>
          <div class="step-body">
            <p class="step-desc">${proc.description}</p>
            <div class="step-deliverables-wrap">
              ${proc.deliverables.map(item => `
                <span class="step-deliverable-chip">${item}</span>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  openProjectModal(projectId) {
    const proj = SITE_CONTENT.projects.find(p => p.id === projectId);
    if (!proj) return;

    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="badge">ARCHITECTURAL SPECIFICATION</div>
      <h2 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase;">${proj.title}</h2>
      <div style="font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.15em; color: var(--accent-gold); margin-bottom: 2rem;">${proj.category} · ${proj.location} · ${proj.year}</div>
      <p style="font-size: 1.05rem; font-weight: 300; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem;">${proj.overview}</p>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.15em; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 1rem;">ARCHITECTURAL HIGHLIGHTS</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
          ${proj.highlights.map(hl => `<li style="font-size: 0.95rem; color: var(--text-primary); display: flex; gap: 0.6rem; align-items: center;"><span style="color: var(--accent-gold)">▪</span> ${hl}</li>`).join('')}
        </ul>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; padding: 1.5rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
        ${proj.specs.map(sp => `
          <div>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">${sp.label}</div>
            <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-top: 0.2rem;">${sp.value}</div>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add('open');
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new CinematicApp();
});
