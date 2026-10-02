import React from 'react';
import { SITE_CONTENT } from '../data/content';

export const ProcessSection: React.FC = () => {
  const { process } = SITE_CONTENT;

  return (
    <>
      <section id="process" className="section-padding">
        <div className="container">
          <div>
            <div className="badge">EXECUTION METHODOLOGY</div>
            <h2 className="section-headline">
              From Foundation <span className="highlight">To Finish</span>
            </h2>
            <p className="section-lead">
              A rigorous seven-phase construction lifecycle ensuring absolute design
              fidelity, structural longevity, and seamless project delivery.
            </p>
          </div>

          <div className="process-timeline" id="process-timeline">
            {process.map((proc) => (
              <div key={proc.step} className="process-step-item">
                <div className="step-box">
                  <span className="step-num">{proc.step}</span>
                  <span className="step-phase">PHASE</span>
                </div>
                <div className="step-header">
                  <h3 className="step-title">{proc.title}</h3>
                  <span className="step-subtitle">{proc.subtitle}</span>
                </div>
                <div className="step-body">
                  <p className="step-desc">{proc.description}</p>
                  <div className="step-deliverables-wrap">
                    {proc.deliverables.map((item, iIdx) => (
                      <span key={iIdx} className="step-deliverable-chip">
                        {item}
                      </span>
                    ))}
                  </div>
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
