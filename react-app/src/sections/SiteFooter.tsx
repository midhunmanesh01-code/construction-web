import React from 'react';
import { SITE_CONTENT } from '../data/content';

export const SiteFooter: React.FC = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Main Footer Directory Grid */}
        <div className="footer-grid">
          {/* Col 1: Studio Brand & Inquiries */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <span className="footer-logo-title">
                <span className="brand-mm">M & M</span> CONSTRUCTIONS
              </span>
              <span className="footer-logo-tagline">{SITE_CONTENT.brand.tagline}</span>
            </div>
            
            <div className="footer-quick-meta">
              <div className="quick-meta-item">
                <span className="meta-label">STUDIO LOCATION</span>
                <span className="meta-val">Kerala, India · {SITE_CONTENT.brand.coordinates}</span>
              </div>
              <div className="quick-meta-item">
                <span className="meta-label">CONSULTATION</span>
                <a
                  href="#contact"
                  className="meta-link"
                  onClick={(e) => handleNavClick(e, '#contact')}
                >
                  Schedule an Appointment →
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation 3 rows x 2 columns */}
          <div className="footer-col footer-col-nav">
            <h4 className="footer-col-title">NAVIGATION</h4>
            <div className="footer-nav-grid">
              <a href="#cinematic-section" onClick={(e) => handleNavClick(e, '#cinematic-section')}>
                Cinematic Hero
              </a>
              <a href="#projects" onClick={(e) => handleNavClick(e, '#projects')}>
                Featured Projects
              </a>

              <a href="#about" onClick={(e) => handleNavClick(e, '#about')}>
                About Practice
              </a>
              <a href="#process" onClick={(e) => handleNavClick(e, '#process')}>
                Execution Process
              </a>

              <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>
                Services & Disciplines
              </a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>
                Contact & Inquiries
              </a>
            </div>
          </div>

          {/* Col 3: Studio Practice Info & Back to Top */}
          <div className="footer-col footer-col-practice">
            <h4 className="footer-col-title">PRACTICE</h4>
            <div className="footer-practice-info">
              <div className="practice-info-item">
                <span className="meta-label">STUDIO HOURS</span>
                <span className="meta-val">Mon – Sat: 09:00 – 18:00 IST</span>
              </div>
              <div className="practice-info-item">
                <span className="meta-label">OPERATING REGION</span>
                <span className="meta-val">Kerala & South India</span>
              </div>
            </div>

            <button
              id="btn-back-top"
              className="footer-back-to-top"
              onClick={handleBackToTop}
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <span className="arrow">↑</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar with Creator Credit */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {new Date().getFullYear()} M & M CONSTRUCTIONS. ALL RIGHTS RESERVED.
          </div>

          <div className="footer-creator-credit">
            Made with <span className="heart">❤️</span> Midhun Manesh
          </div>

          <div className="footer-brand-motto">
            FROM FOUNDATION TO FINISH
          </div>
        </div>
      </div>
    </footer>
  );
};
