import React from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`} id="mobile-drawer">
      <button
        className="modal-close-btn"
        id="mobile-close-btn"
        style={{ top: '2rem', right: '2rem' }}
        onClick={onClose}
      >
        ✕
      </button>
      <ul className="mobile-nav-links">
        <li>
          <a
            href="#cinematic-section"
            className="mobile-nav-link"
            onClick={(e) => handleLinkClick(e, '#cinematic-section')}
          >
            01 · Experience
          </a>
        </li>
        <li>
          <a
            href="#about"
            className="mobile-nav-link"
            onClick={(e) => handleLinkClick(e, '#about')}
          >
            02 · About
          </a>
        </li>
        <li>
          <a
            href="#services"
            className="mobile-nav-link"
            onClick={(e) => handleLinkClick(e, '#services')}
          >
            03 · Services
          </a>
        </li>
        <li>
          <a
            href="#projects"
            className="mobile-nav-link"
            onClick={(e) => handleLinkClick(e, '#projects')}
          >
            04 · Projects
          </a>
        </li>
        <li>
          <a
            href="#process"
            className="mobile-nav-link"
            onClick={(e) => handleLinkClick(e, '#process')}
          >
            05 · Process
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="mobile-nav-link"
            onClick={(e) => handleLinkClick(e, '#contact')}
          >
            06 · Contact
          </a>
        </li>
      </ul>
    </div>
  );
};
