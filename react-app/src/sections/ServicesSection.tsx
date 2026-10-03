import React, { useState } from 'react';
import { SITE_CONTENT } from '../data/content';

export const ServicesSection: React.FC = () => {
  const { services } = SITE_CONTENT;
  const [expandedId, setExpandedId] = useState<string | null>(services[0].id);

  const toggleService = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleInquireClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section id="services" className="section-padding">
        <div className="container">
          {/* Section Header with Live Notification Indicator */}
          <div className="services-header-wrap">
            <div className="services-header-left">
              <div className="badge">DISCIPLINES & CAPABILITIES</div>
              <h2 className="section-headline">
                Architectural <span className="highlight">Disciplines</span>
              </h2>
            </div>
            <div className="services-header-right">
              <div className="services-notification-indicator">
                <span className="notify-pulse-dot" />
                <span className="notify-indicator-text">
                  5 ACTIVE DISCIPLINES · TAP TO EXPAND SPECIFICATION
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Notification Stack */}
          <div className="services-notify-stack" id="services-notify-stack">
            {services.map((svc) => {
              const isOpen = expandedId === svc.id;

              return (
                <div
                  key={svc.id}
                  className={`service-notify-card ${isOpen ? 'expanded' : ''}`}
                  onClick={() => toggleService(svc.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleService(svc.id);
                    }
                  }}
                  aria-expanded={isOpen}
                >
                  {/* Notification Bar / Header */}
                  <div className="notify-banner">
                    <div className="notify-left">
                      <div className="notify-icon-box">
                        <span className="notify-num">{svc.number}</span>
                      </div>
                      <div className="notify-meta">
                        <div className="notify-title-row">
                          <h3 className="notify-title">{svc.title}</h3>
                          <span className="notify-focus-pill">{svc.focus}</span>
                        </div>
                        <div className="notify-subtitle">{svc.tagline}</div>
                      </div>
                    </div>

                    <div className="notify-right">
                      <span className="notify-status-hint">
                        {isOpen ? 'COLLAPSE' : 'EXPAND SPEC'}
                      </span>
                      <div className={`notify-toggle-btn ${isOpen ? 'active' : ''}`}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Notification Body */}
                  <div className="notify-expandable-wrap">
                    <div className="notify-expandable-inner">
                      <div className="notify-body-content">
                        <div className="notify-desc-col">
                          <span className="notify-section-title">OVERVIEW & PHILOSOPHY</span>
                          <p className="notify-desc-text">{svc.description}</p>
                          <a
                            href="#contact"
                            className="notify-inquire-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInquireClick(e);
                            }}
                          >
                            <span>Inquire for {svc.title}</span>
                            <span className="btn-arrow">→</span>
                          </a>
                        </div>

                        <div className="notify-deliverables-col">
                          <span className="notify-section-title">CORE DELIVERABLES</span>
                          <ul className="notify-deliverables-list">
                            {svc.deliverables.map((del, dIdx) => (
                              <li key={dIdx} className="notify-deliverable-item">
                                <span className="notify-bullet" />
                                <span className="notify-del-text">{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="notify-corner-accent" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <hr className="architectural-divider" />
    </>
  );
};
