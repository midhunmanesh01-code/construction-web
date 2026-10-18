import React, { useState, useEffect } from 'react';

interface SiteHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('cinematic-section');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detect currently viewed section
      const sections = [
        'cinematic-section',
        'about',
        'services',
        'projects',
        'process',
        'contact',
      ];
      const scrollPos = window.scrollY + 130;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (isMobileMenuOpen) {
      onToggleMobileMenu();
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <a
          href="#cinematic-section"
          className="brand-logo"
          onClick={(e) => handleNavClick(e, '#cinematic-section')}
          aria-label="M & M Constructions Home"
        >
          <span className="logo-main">
            M &amp; M<span className="logo-dot">.</span>
          </span>
          <span className="logo-sub">CONSTRUCTIONS</span>
        </a>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a
                href="#cinematic-section"
                className={`nav-link ${activeSection === 'cinematic-section' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '#cinematic-section')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '#about')}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#services"
                className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '#services')}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '#projects')}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="#process"
                className={`nav-link ${activeSection === 'process' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '#process')}
              >
                Process
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '#contact')}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <a
            href="#contact"
            className="btn-inquire"
            onClick={(e) => handleNavClick(e, '#contact')}
          >
            Inquire
          </a>
          <button
            className={`menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            id="menu-toggle"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={onToggleMobileMenu}
          >
            <span className="menu-bar bar-top" />
            <span className="menu-bar bar-bottom" />
          </button>
        </div>
      </div>
    </header>
  );
};
