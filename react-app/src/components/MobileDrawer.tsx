import React, { useEffect, useRef } from 'react';
import { SITE_CONTENT } from '../data/content';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and handle Escape key when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <div
      className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
      id="mobile-drawer"
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      ref={drawerRef}
    >
      {/* Backdrop for click-to-dismiss */}
      <div
        className="mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content Sheet */}
      <div className="mobile-drawer-content">
        {/* Top Header inside Drawer */}
        <div className="mobile-drawer-top">
          <div className="mobile-drawer-brand">
            <span className="drawer-logo-main">
              M &amp; M<span className="drawer-dot">.</span>
            </span>
            <span className="drawer-logo-sub">CONSTRUCTIONS</span>
          </div>
          <button
            className="mobile-drawer-close-btn"
            id="mobile-close-btn"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Links List */}
        <nav className="mobile-drawer-nav">
          <ul className="mobile-nav-links">
            <li>
              <a
                href="#cinematic-section"
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, '#cinematic-section')}
              >
                <span className="nav-num">01</span>
                <span className="nav-text">Home / Studio</span>
                <span className="nav-arrow">→</span>
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, '#about')}
              >
                <span className="nav-num">02</span>
                <span className="nav-text">About Practice</span>
                <span className="nav-arrow">→</span>
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, '#services')}
              >
                <span className="nav-num">03</span>
                <span className="nav-text">Disciplines &amp; Services</span>
                <span className="nav-arrow">→</span>
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, '#projects')}
              >
                <span className="nav-num">04</span>
                <span className="nav-text">Selected Residences</span>
                <span className="nav-arrow">→</span>
              </a>
            </li>
            <li>
              <a
                href="#process"
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, '#process')}
              >
                <span className="nav-num">05</span>
                <span className="nav-text">Execution Process</span>
                <span className="nav-arrow">→</span>
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, '#contact')}
              >
                <span className="nav-num">06</span>
                <span className="nav-text">Contact &amp; Inquire</span>
                <span className="nav-arrow">→</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Direct Action Footer within Drawer */}
        <div className="mobile-drawer-footer">
          <div className="drawer-contact-actions">
            <a
              href="tel:+917012495244"
              className="drawer-action-btn drawer-call-btn"
              onClick={onClose}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <span>Call Studio</span>
            </a>
            <a
              href={`https://wa.me/918078807927?text=${encodeURIComponent("Hi! I'd like to know more about M & M Constructions.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-action-btn drawer-wa-btn"
              onClick={onClose}
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.64.764 5.103 2.08 7.185L3 29l6.02-1.54A13.43 13.43 0 0 0 16 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5zm7.845 19.063c-.328.924-1.624 1.768-2.656 1.992-.705.152-1.625.274-4.73-1.014-3.968-1.646-6.526-5.674-6.724-5.937-.197-.263-1.611-2.146-1.611-4.093 0-1.947 1.019-2.905 1.38-3.3.362-.395.789-.494 1.052-.494.263 0 .526.002.756.014.242.012.566-.092.887.678.328.79 1.117 2.73 1.215 2.928.098.197.164.428.033.69-.131.263-.197.428-.394.658-.197.23-.414.512-.592.688-.197.197-.403.411-.173.805.23.395 1.021 1.688 2.191 2.73 1.507 1.342 2.777 1.758 3.172 1.955.395.197.624.164.854-.099.23-.263.986-1.15 1.249-1.545.263-.395.526-.328.887-.197.361.131 2.298 1.084 2.692 1.281.394.197.657.296.756.46.098.164.098.954-.23 1.878z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
          <div className="drawer-footer-meta">
            <span>{SITE_CONTENT.brand.coordinates}</span>
            <span>·</span>
            <span>KERALA, INDIA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
