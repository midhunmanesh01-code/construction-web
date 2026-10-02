import React from 'react';
import { SITE_CONTENT } from '../data/content';

interface PreloaderProps {
  progress: number;
  isLoaded: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ progress, isLoaded }) => {
  return (
    <div id="preloader" className={isLoaded ? 'loaded' : ''}>
      <div className="preloader-content">
        <div className="preloader-brand">{SITE_CONTENT.brand.name}</div>
        <div className="preloader-tagline">{SITE_CONTENT.brand.tagline}</div>
        <div className="preloader-bar-container">
          <div
            className="preloader-bar"
            id="preloader-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="preloader-status">
          <span>INITIALIZING ARCHITECTURAL SEQUENCE</span>
          <span id="preloader-percent">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
