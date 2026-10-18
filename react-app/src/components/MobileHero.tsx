import React from 'react';
import { SITE_CONTENT } from '../data/content';

export const MobileHero: React.FC = () => {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mobile-static-hero" role="banner" aria-label="M & M Constructions">
      {/* Real High-Resolution Architectural Villa Photography */}
      <div className="mobile-hero-bg-wrap" aria-hidden="true">
        <img
          src="/images/hero-residence.jpg"
          alt="Luxury Tropical Architectural Residence"
          className="mobile-hero-bg-img"
          loading="eager"
        />
        <div className="mobile-hero-gradient-overlay" />
      </div>

      <div className="mobile-hero-content">
        {/* Minimal Studio Badge */}
        <div className="mobile-hero-badge-wrap">
          <span className="mobile-hero-badge">
            <span className="badge-dot" />
            ARCHITECTURAL PRACTICE · KERALA
          </span>
        </div>

        {/* Central Brand Headlines */}
        <div className="mobile-hero-brand">
          <h1 className="mobile-hero-title">
            M &amp; M
            <span className="mobile-title-sub">CONSTRUCTIONS</span>
          </h1>
          <p className="mobile-hero-tagline">{SITE_CONTENT.brand.tagline}</p>
          <p className="mobile-hero-lead">
            Engineering bespoke luxury residences and modern tropical statements
            with uncompromising structural craft.
          </p>
        </div>

        {/* Spacious Action Buttons */}
        <div className="mobile-hero-actions">
          <a
            href="#projects"
            className="mobile-hero-btn primary"
            onClick={(e) => handleScrollTo(e, '#projects')}
          >
            Explore Projects
          </a>
          <a
            href="#contact"
            className="mobile-hero-btn secondary"
            onClick={(e) => handleScrollTo(e, '#contact')}
          >
            Inquire Build
          </a>
        </div>

        {/* Clean Scroll Cue */}
        <a
          href="#about"
          className="mobile-hero-scroll-cue"
          onClick={(e) => handleScrollTo(e, '#about')}
          aria-label="Scroll to About section"
        >
          <span className="scroll-cue-text">SCROLL TO DISCOVER</span>
          <span className="scroll-cue-arrow">↓</span>
        </a>
      </div>
    </div>
  );
};
