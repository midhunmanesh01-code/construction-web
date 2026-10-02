import React from 'react';
import { SITE_CONTENT } from '../data/content';

export const ServicesSection: React.FC = () => {
  const { services } = SITE_CONTENT;

  return (
    <>
      <section id="services" className="section-padding">
        <div className="container">
          <div className="services-header">
            <div className="badge">DISCIPLINES & CAPABILITIES</div>
            <h2 className="section-headline">
              Architectural Construction{' '}
              <span className="highlight">Services</span>
            </h2>
            <p className="section-lead">
              Comprehensive turnkey execution, structural engineering, and master
              millwork tailored to bespoke residential commissions.
            </p>
          </div>

          <div className="services-list" id="services-list">
            {services.map((svc) => (
              <div key={svc.id} className="service-row">
                <div className="service-num">{svc.number}</div>
                <div className="service-main">
                  <h3 className="service-title">{svc.title}</h3>
                  <div className="service-tagline">{svc.tagline}</div>
                </div>
                <p className="service-body">{svc.description}</p>
                <div className="service-deliverables">
                  {svc.deliverables.slice(0, 3).map((del, dIdx) => (
                    <span key={dIdx} className="deliverable-tag">
                      {del}
                    </span>
                  ))}
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
