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
                <div>
                  <div className="project-top-meta">
                    <span className="proj-number">PROJECT {proj.number}</span>
                    <span className="proj-status">
                      {proj.year} · {proj.location}
                    </span>
                  </div>
                  <h3 className="proj-title">{proj.title}</h3>
                  <div className="proj-category">{proj.category}</div>
                  <p className="proj-overview">{proj.overview}</p>
                  <div className="proj-specs-grid">
                    {proj.specs.map((sp, sIdx) => (
                      <div key={sIdx} className="proj-spec-item">
                        <span className="spec-label">{sp.label}</span>
                        <span className="spec-val">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="proj-btn"
                  onClick={() => onSelectProject(proj)}
                >
                  <span>VIEW ARCHITECTURAL SPECIFICATION</span>
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="architectural-divider" />
    </>
  );
};
