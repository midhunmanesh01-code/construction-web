import React, { useEffect, useState } from 'react';
import { SITE_CONTENT } from '../data/content';

interface PreloaderProps {
  progress: number;
  isLoaded: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ progress, isLoaded }) => {
  const [displayPercent, setDisplayPercent] = useState<number>(0);

  // Smooth numeric counter animation
  useEffect(() => {
    const target = Math.max(displayPercent, Math.min(100, Math.round(progress)));
    if (displayPercent < target) {
      const interval = setInterval(() => {
        setDisplayPercent((prev) => {
          if (prev >= target) {
            clearInterval(interval);
            return target;
          }
          const step = Math.max(1, Math.ceil((target - prev) * 0.18));
          return Math.min(target, prev + step);
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [progress, displayPercent]);

  return (
    <div
      id="preloader"
      className={isLoaded ? 'loaded' : ''}
      aria-hidden={isLoaded}
    >
      {/* Top Meta Bar */}
      <div className="preloader-meta-header">
        <div className="preloader-meta-tag">{SITE_CONTENT.brand.shortName} STUDIO</div>
        <div className="preloader-meta-tag">{SITE_CONTENT.brand.coordinates}</div>
      </div>

      {/* Centered Brand Presentation */}
      <div className="preloader-center">
        <h1 className="preloader-title">
          M &amp; M <span className="title-sub">CONSTRUCTIONS</span>
        </h1>
        <div className="preloader-discipline">{SITE_CONTENT.brand.tagline}</div>

        <div className="preloader-track">
          <div
            className="preloader-progress-fill"
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        <div className="preloader-counter">
          <span className="counter-label">LOADING EXPERIENCE</span>
          <span className="counter-value">{String(displayPercent).padStart(2, '0')}%</span>
        </div>
      </div>

      {/* Bottom Meta Bar */}
      <div className="preloader-meta-footer">
        <div className="preloader-meta-tag">LUXURY ARCHITECTURAL EXECUTION</div>
        <div className="preloader-meta-tag">{SITE_CONTENT.brand.elevation}</div>
      </div>
    </div>
  );
};
