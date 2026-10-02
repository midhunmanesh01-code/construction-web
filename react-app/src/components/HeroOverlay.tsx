import React from 'react';
import { SITE_CONTENT } from '../data/content';

interface HeroOverlayProps {
  isVisible: boolean;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ isVisible }) => {
  return (
    <div id="hero-overlay" className={isVisible ? '' : 'hidden'}>
      <div className="hero-meta-top">
        <div className="hero-coords">{SITE_CONTENT.brand.coordinates}</div>
        <div className="hero-elevation">{SITE_CONTENT.brand.elevation}</div>
      </div>

      <div className="hero-center">
        <h1 className="hero-brand-title">
          M & M<br />CONSTRUCTIONS
        </h1>
        <div className="hero-brand-subtitle">{SITE_CONTENT.brand.tagline}</div>
      </div>

      <div className="hero-scroll-cue">
        <span className="scroll-indicator-text">SCROLL TO EXPLORE JOURNEY</span>
        <div className="scroll-line-anim" />
      </div>
    </div>
  );
};
