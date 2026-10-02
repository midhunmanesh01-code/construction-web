import React from 'react';

interface SiteHeaderProps {
  onOpenMobileMenu: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ onOpenMobileMenu }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          href="#cinematic-section"
          className="brand-logo"
          onClick={(e) => handleNavClick(e, '#cinematic-section')}
        >
          <span className="logo-main">
            M & M<span className="logo-dot">.</span>
          </span>
          <span className="logo-sub">CONSTRUCTIONS</span>
        </a>

        <nav>
          <ul className="nav-links">
            <li>
              <a
                href="#cinematic-section"
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#cinematic-section')}
              >
                Experience
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#about')}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#services')}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#projects')}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="#process"
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#process')}
              >
                Process
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="nav-link"
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
            className="menu-toggle"
            id="menu-toggle"
            aria-label="Toggle Navigation"
            onClick={onOpenMobileMenu}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};
