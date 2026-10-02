import React from 'react';
import { ProjectItem } from '../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  return (
    <div
      id="project-modal"
      className="open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <button className="modal-close-btn" id="modal-close" onClick={onClose}>
          ✕
        </button>
        <div id="modal-body">
          <div className="badge">ARCHITECTURAL SPECIFICATION</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            {project.title}
          </h2>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--accent-gold)',
              marginBottom: '2rem',
            }}
          >
            {project.category} · {project.location} · {project.year}
          </div>
          <p
            style={{
              fontSize: '1.05rem',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            {project.overview}
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              ARCHITECTURAL HIGHLIGHTS
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {project.highlights.map((hl, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--accent-gold)' }}>▪</span> {hl}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              padding: '1.5rem 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {project.specs.map((sp, idx) => (
              <div key={idx}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {sp.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: '0.2rem',
                  }}
                >
                  {sp.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
