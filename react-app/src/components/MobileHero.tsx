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
    <div className="mobile-static-hero" role="banner" aria-label="M & M Constructions Overview">
      {/* Ambient background glow & architectural blueprint grid */}
      <div className="mobile-hero-ambient" />
      <div className="mobile-hero-grid-pattern" />

      {/* Architectural Technical Corner Markings */}
      <div className="mobile-corner mobile-corner-tl" aria-hidden="true" />
      <div className="mobile-corner mobile-corner-tr" aria-hidden="true" />
      <div className="mobile-corner mobile-corner-bl" aria-hidden="true" />
      <div className="mobile-corner mobile-corner-br" aria-hidden="true" />

      <div className="mobile-hero-container">
        {/* Top Architectural Telemetry & Status Badge */}
        <div className="mobile-hero-meta">
          <span className="mobile-meta-badge">
            <span className="meta-pulse-dot" />
            STUDIO ACTIVE · BESPOKE RESIDENTIAL
          </span>
          <div className="mobile-meta-coords">{SITE_CONTENT.brand.coordinates}</div>
        </div>

        {/* Central Brand Identity & Heading */}
        <div className="mobile-hero-brand">
          <span className="mobile-hero-eyebrow">
            ARCHITECTURAL ENGINEERING &amp; EXECUTION
          </span>
          <h1 className="mobile-hero-title">
            M &amp; M
            <span className="mobile-title-sub">CONSTRUCTIONS</span>
          </h1>
          <div className="mobile-hero-divider" aria-hidden="true" />
          <p className="mobile-hero-tagline">{SITE_CONTENT.brand.tagline}</p>
          <p className="mobile-hero-lead">
            Engineering bespoke luxury residences and modern architectural statements
            with uncompromising structural precision across Kerala.
          </p>
        </div>

        {/* Action Call-to-Actions */}
        <div className="mobile-hero-actions">
          <a
            href="#projects"
            className="mobile-btn-primary"
            onClick={(e) => handleScrollTo(e, '#projects')}
          >
            <span>Explore Portfolio</span>
            <span className="btn-arrow">→</span>
          </a>
          <a
            href="#contact"
            className="mobile-btn-secondary"
            onClick={(e) => handleScrollTo(e, '#contact')}
          >
            <span>Inquire Build</span>
          </a>
        </div>

        {/* Architectural Pillars / Credentials Strip */}
        <div className="mobile-hero-metrics">
          <div className="mobile-metric-item">
            <span className="metric-val">18+</span>
            <span className="metric-lbl">Years Precision</span>
          </div>
          <div className="metric-sep" aria-hidden="true" />
          <div className="mobile-metric-item">
            <span className="metric-val">100%</span>
            <span className="metric-lbl">Turnkey Build</span>
          </div>
          <div className="metric-sep" aria-hidden="true" />
          <div className="mobile-metric-item">
            <span className="metric-val">Zero</span>
            <span className="metric-lbl">Deflection Rigor</span>
          </div>
        </div>

        {/* Scroll Cue down to About section */}
        <a
          href="#about"
          className="mobile-scroll-cue"
          onClick={(e) => handleScrollTo(e, '#about')}
          aria-label="Scroll to About section"
        >
          <span className="mobile-scroll-text">SCROLL TO DISCOVER</span>
          <div className="mobile-scroll-arrow">↓</div>
        </a>
      </div>
    </div>
  );
};
