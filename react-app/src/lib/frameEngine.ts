/**
 * ==========================================================================
 * M & M CONSTRUCTIONS — ULTRA-PERFORMANCE CINEMATIC FRAME ENGINE
 * ==========================================================================
 */

export interface FrameEngineConfig {
  totalFrames: number;
  framePath: (index: number) => string;
  maxCacheSize: number;
  concurrencyLimit: number;
  keyframeStep: number;
  preloadAhead: number;
  preloadBehind: number;
  lerpFactor: number;
  maxDPR: number;
}

export type DecodedFrame = ImageBitmap | HTMLImageElement;

export interface FrameLookupResult {
  img: DecodedFrame | null;
  isExact: boolean;
  sourceIndex: number;
}

export class FrameCacheManager {
  private config: FrameEngineConfig;
  private onFrameLoadedCallback?: (index: number) => void;
  private cache: Map<number, DecodedFrame> = new Map();
  private permanentKeys: Set<number> = new Set();
  private loadingSet: Set<number> = new Set();
  private activeControllers: Map<number, AbortController> = new Map();
  private queue: number[] = [];
  private activeWorkers = 0;
  private lastDrawnImage: DecodedFrame | null = null;
  private initialBufferTarget = 15;
  private loadedBufferCount = 0;
  private onInitialReady: (() => void) | null = null;
  private onBufferProgress?: (percent: number) => void;

  constructor(
    config: FrameEngineConfig,
    onFrameLoadedCallback?: (index: number) => void,
    onBufferProgress?: (percent: number) => void
  ) {
    this.config = config;
    this.onFrameLoadedCallback = onFrameLoadedCallback;
    this.onBufferProgress = onBufferProgress;

    // Register permanent keyframe set
    for (let i = 1; i <= this.config.totalFrames; i += this.config.keyframeStep) {
      this.permanentKeys.add(i);
    }
    this.permanentKeys.add(this.config.totalFrames);
  }

  public getNearestFrame(targetIndex: number): FrameLookupResult {
    if (this.cache.has(targetIndex)) {
      const img = this.cache.get(targetIndex)!;
      this.lastDrawnImage = img;
      return { img, isExact: true, sourceIndex: targetIndex };
    }

    // Fast directional search outwards from targetIndex
    const maxSearch = 60;
    for (let offset = 1; offset <= maxSearch; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 1 && this.cache.has(prev)) {
        const img = this.cache.get(prev)!;
        this.lastDrawnImage = img;
        return { img, isExact: false, sourceIndex: prev };
      }
      const next = targetIndex + offset;
      if (next <= this.config.totalFrames && this.cache.has(next)) {
        const img = this.cache.get(next)!;
        this.lastDrawnImage = img;
        return { img, isExact: false, sourceIndex: next };
      }
    }

    if (this.lastDrawnImage) {
      return { img: this.lastDrawnImage, isExact: false, sourceIndex: -1 };
    }

    for (const [idx, img] of this.cache.entries()) {
      this.lastDrawnImage = img;
      return { img, isExact: false, sourceIndex: idx };
    }

    return { img: null, isExact: false, sourceIndex: -1 };
  }

  public requestFrames(targetIndex: number, direction = 1, velocity = 0): void {
    this.pruneCache(targetIndex);

    // Abort obsolete workers that are far (> 60 frames) from targetIndex
    for (const [activeIdx, controller] of this.activeControllers.entries()) {
      if (Math.abs(activeIdx - targetIndex) > 60 && !this.permanentKeys.has(activeIdx)) {
        controller.abort();
        this.activeControllers.delete(activeIdx);
        this.loadingSet.delete(activeIdx);
        this.activeWorkers = Math.max(0, this.activeWorkers - 1);
      }
    }

    const desired: number[] = [targetIndex];

    // Priority 1: Immediate neighbors (+/- 5 frames)
    for (let i = 1; i <= 5; i++) {
      if (targetIndex + i <= this.config.totalFrames) desired.push(targetIndex + i);
      if (targetIndex - i >= 1) desired.push(targetIndex - i);
    }

    // Priority 2: Lookahead based on scroll direction & velocity
    const dynamicAhead = Math.min(60, this.config.preloadAhead + Math.round(velocity * 10));
    const dynamicBehind = this.config.preloadBehind;

    if (direction >= 0) {
      for (let i = 6; i <= dynamicAhead; i++) {
        const idx = targetIndex + i;
        if (idx <= this.config.totalFrames) desired.push(idx);
      }
      for (let i = 6; i <= dynamicBehind; i++) {
        const idx = targetIndex - i;
        if (idx >= 1) desired.push(idx);
      }
    } else {
      for (let i = 6; i <= dynamicAhead; i++) {
        const idx = targetIndex - i;
        if (idx >= 1) desired.push(idx);
      }
      for (let i = 6; i <= dynamicBehind; i++) {
        const idx = targetIndex + i;
        if (idx <= this.config.totalFrames) desired.push(idx);
      }
    }

    // Sort queue strictly by distance to targetIndex (nearest first)
    const unCached = desired.filter(idx => !this.cache.has(idx) && !this.loadingSet.has(idx));
    unCached.sort((a, b) => Math.abs(a - targetIndex) - Math.abs(b - targetIndex));
    this.queue = unCached;

    this.processQueue();
  }

  private processQueue(): void {
    while (this.activeWorkers < this.config.concurrencyLimit && this.queue.length > 0) {
      const nextIndex = this.queue.shift();
      if (nextIndex && !this.cache.has(nextIndex) && !this.loadingSet.has(nextIndex)) {
        this.loadFrame(nextIndex);
      }
    }

    // Opportunistic idle prefetch of permanent keyframes
    if (this.queue.length === 0 && this.activeWorkers < Math.floor(this.config.concurrencyLimit / 2)) {
      this.fillKeyframeWorker();
    }
  }

  private fillKeyframeWorker(): void {
    for (const keyframe of this.permanentKeys) {
      if (!this.cache.has(keyframe) && !this.loadingSet.has(keyframe)) {
        this.loadFrame(keyframe);
        break;
      }
    }
  }

  private async loadFrame(index: number): Promise<void> {
    if (this.cache.has(index) || this.loadingSet.has(index)) {
      return;
    }

    const controller = new AbortController();
    this.activeControllers.set(index, controller);
    this.loadingSet.add(index);
    this.activeWorkers++;

    const url = this.config.framePath(index);

    try {
      let imageObj: DecodedFrame;

      if (typeof window !== 'undefined' && 'createImageBitmap' in window && 'fetch' in window) {
        const res = await fetch(url, {
          signal: controller.signal,
          cache: 'force-cache',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        imageObj = await createImageBitmap(blob);
      } else {
        imageObj = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      }

      this.cache.set(index, imageObj);
      this.activeControllers.delete(index);
      this.loadingSet.delete(index);
      this.activeWorkers--;

      if (this.loadedBufferCount < this.initialBufferTarget) {
        this.loadedBufferCount++;
        const percent = Math.min(100, Math.round((this.loadedBufferCount / this.initialBufferTarget) * 100));
        if (this.onBufferProgress) this.onBufferProgress(percent);
        if (this.loadedBufferCount >= this.initialBufferTarget && this.onInitialReady) {
          this.onInitialReady();
          this.onInitialReady = null;
        }
      }

      if (this.onFrameLoadedCallback) {
        this.onFrameLoadedCallback(index);
      }

      this.processQueue();
    } catch (err: unknown) {
      this.activeControllers.delete(index);
      this.loadingSet.delete(index);
      this.activeWorkers--;
      if ((err as Error)?.name !== 'AbortError') {
        this.processQueue();
      }
    }
  }

  private pruneCache(currentIndex: number): void {
    if (this.cache.size <= this.config.maxCacheSize) return;

    const evictableKeys: number[] = [];
    for (const key of this.cache.keys()) {
      if (!this.permanentKeys.has(key)) {
        evictableKeys.push(key);
      }
    }

    evictableKeys.sort((a, b) => Math.abs(b - currentIndex) - Math.abs(a - currentIndex));

    const removeCount = this.cache.size - this.config.maxCacheSize;
    for (let i = 0; i < removeCount && i < evictableKeys.length; i++) {
      const keyToRemove = evictableKeys[i];
      const obj = this.cache.get(keyToRemove);
      if (obj && 'close' in obj && typeof (obj as ImageBitmap).close === 'function') {
        (obj as ImageBitmap).close();
      }
      this.cache.delete(keyToRemove);
    }
  }

  public preloadInitialSequence(callback: () => void): void {
    this.onInitialReady = callback;

    setTimeout(() => {
      if (this.onInitialReady) {
        console.warn('[M&M Engine] Initial buffer timeout. Releasing preloader.');
        if (this.onBufferProgress) this.onBufferProgress(100);
        this.onInitialReady();
        this.onInitialReady = null;
      }
    }, 3500);

    this.loadFrame(1);
    for (let i = 2; i <= this.initialBufferTarget; i++) {
      this.queue.push(i);
    }
    this.processQueue();

    setTimeout(() => this.preloadKeyframeGrid(), 800);
  }

  private preloadKeyframeGrid(): void {
    for (const keyframe of this.permanentKeys) {
      if (!this.cache.has(keyframe) && !this.loadingSet.has(keyframe)) {
        this.queue.push(keyframe);
      }
    }
    this.processQueue();
  }

  public destroy(): void {
    for (const [, controller] of this.activeControllers.entries()) {
      controller.abort();
    }
    this.activeControllers.clear();
    for (const [, obj] of this.cache.entries()) {
      if (obj && 'close' in obj && typeof (obj as ImageBitmap).close === 'function') {
        (obj as ImageBitmap).close();
      }
    }
    this.cache.clear();
    this.queue = [];
    this.loadingSet.clear();
  }
}
