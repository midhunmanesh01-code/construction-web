import React from 'react';
import { SITE_CONTENT } from '../data/content';
import { ProjectItem } from '../types';

interface ProjectsSectionProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
}) => {
  const { projects } = SITE_CONTENT;

  return (
    <>
      <section id="projects" className="section-padding">
        <div className="container">
          <div>
            <div className="badge">PORTFOLIO OF WORKS</div>
            <h2 className="section-headline">
              Selected <span className="highlight">Residences</span>
            </h2>
            <p className="section-lead">
              A curation of bespoke tropical residences engineered and executed
              with uncompromising architectural fidelity.
            </p>
          </div>

          <div className="projects-grid" id="projects-grid">
            {projects.map((proj) => (
              <div key={proj.id} className="project-card">
                <div className="project-card-media" onClick={() => onSelectProject(proj)}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="project-card-img"
                    loading="lazy"
                  />
                  <div className="project-card-img-overlay" />
                  <div className="project-card-badge">
                    <span>{proj.year}</span>
                    <span className="dot">·</span>
                    <span>{proj.location}</span>
                  </div>
                </div>

                <div className="project-card-body">
                  <div className="project-top-meta">
                    <span className="proj-number">PROJECT {proj.number}</span>
                    <span className="proj-category-pill">{proj.category}</span>
                  </div>
                  <h3 className="proj-title">{proj.title}</h3>
                  <p className="proj-overview">{proj.overview}</p>
                  <div className="proj-specs-grid">
                    {proj.specs.slice(0, 2).map((sp, sIdx) => (
                      <div key={sIdx} className="proj-spec-item">
                        <span className="spec-label">{sp.label}</span>
                        <span className="spec-val">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="proj-btn"
                    onClick={() => onSelectProject(proj)}
                  >
                    <span>VIEW ARCHITECTURAL SPECIFICATION</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="architectural-divider" />
    </>
  );
};
