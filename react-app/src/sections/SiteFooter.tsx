import React from 'react';
import { SITE_CONTENT } from '../data/content';

export const SiteFooter: React.FC = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand-title">{SITE_CONTENT.footer.brand}</div>
            <div className="footer-brand-tagline">{SITE_CONTENT.footer.tagline}</div>
          </div>

          <div className="footer-coords">
            <div>{SITE_CONTENT.brand.coordinates}</div>
            <div>{SITE_CONTENT.brand.elevation} · KERALA, INDIA</div>
          </div>

          <div>
            <button
              id="btn-back-top"
              className="btn-back-top"
              onClick={handleBackToTop}
            >
              <span>↑</span>
              <span>BACK TO TOP</span>
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div>{SITE_CONTENT.footer.copyright.toUpperCase()}</div>
          <div>{SITE_CONTENT.brand.discipline.toUpperCase()}</div>
        </div>
      </div>
    </footer>
  );
};
