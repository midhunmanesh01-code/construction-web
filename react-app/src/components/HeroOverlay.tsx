import React from 'react';
import { SITE_CONTENT } from '../data/content';

interface HeroOverlayProps {
  isVisible: boolean;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ isVisible }) => {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="hero-overlay" className={isVisible ? '' : 'hidden'}>
      <div className="hero-center">
        <div className="badge hero-badge">ARCHITECTURAL PRACTICE · KERALA</div>

        <h1 className="hero-brand-title">
          M &amp; M<br />CONSTRUCTIONS
        </h1>

        <div className="hero-brand-subtitle">{SITE_CONTENT.brand.tagline}</div>
        <p className="hero-brand-lead">
          Engineering bespoke luxury residences and modern architectural statements
          with uncompromising structural precision.
        </p>

        <div className="hero-actions">
          <a
            href="#projects"
            className="hero-btn-primary"
            onClick={(e) => handleScrollTo(e, '#projects')}
          >
            Explore Projects
          </a>
          <a
            href="#contact"
            className="hero-btn-secondary"
            onClick={(e) => handleScrollTo(e, '#contact')}
          >
            Inquire Build
          </a>
        </div>
      </div>

      <div className="hero-scroll-cue">
        <span className="scroll-indicator-text">SCROLL TO EXPLORE JOURNEY</span>
        <div className="scroll-line-anim" />
      </div>
    </div>
  );
};
