import React from 'react';
import { SITE_CONTENT } from '../data/content';

export const AboutSection: React.FC = () => {
  const { about } = SITE_CONTENT;

  return (
    <>
      <section id="about" className="section-padding">
        <div className="container">
          <div className="about-grid">
            <div className="about-content-left">
              <div className="badge">{about.badge}</div>
              <h2 className="section-headline">
                Engineering Architectural Statements{' '}
                <span className="highlight">That Endure.</span>
              </h2>
              <p className="section-lead">{about.lead}</p>
            </div>

            <div className="about-content-right">
              {about.paragraphs.map((p, idx) => (
                <p key={idx} className="about-body-text">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="pillars-grid" id="about-pillars">
            {about.pillars.map((pillar) => (
              <div key={pillar.number} className="pillar-card">
                <div className="pillar-num">{pillar.number}</div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <div className="pillar-subtitle">{pillar.subtitle}</div>
                <p className="pillar-desc">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="architectural-divider" />
    </>
  );
};
