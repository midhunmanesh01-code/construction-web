import React, { useState } from 'react';
import { SITE_CONTENT } from '../data/content';

export const ContactSection: React.FC = () => {
  const { contact } = SITE_CONTENT;
  const [formState, setFormState] = useState<'idle' | 'transmitting' | 'transmitted'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'turnkey',
    location: '',
    area: '',
    brief: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('transmitting');
    setTimeout(() => {
      setFormState('transmitted');
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: 'turnkey',
        location: '',
        area: '',
        brief: '',
      });
    }, 900);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container">
        <div className="contact-layout">
          {/* Studio Details Column */}
          <div className="contact-info-col">
            <div>
              <div className="badge">{contact.badge}</div>
              <h2 className="section-headline">
                Let Us Build Your <span className="highlight">Vision.</span>
              </h2>
              <p className="section-lead">{contact.lead}</p>

              <div className="contact-direct-grid">
                <div className="contact-direct-item">
                  <span className="contact-item-label">Direct Telephone</span>
                  <span className="contact-item-value">{contact.details.phone}</span>
                </div>
                <div className="contact-direct-item">
                  <span className="contact-item-label">Studio Email</span>
                  <span className="contact-item-value">{contact.details.email}</span>
                </div>
                <div className="contact-direct-item">
                  <span className="contact-item-label">Studio Location</span>
                  <span className="contact-item-value">{contact.details.location}</span>
                </div>
                <div className="contact-direct-item">
                  <span className="contact-item-label">Consultation Hours</span>
                  <span className="contact-item-value">{contact.details.hours}</span>
                </div>
              </div>
            </div>

            <div className="contact-note">{contact.note}</div>
          </div>

          {/* Project Inquiry Form */}
          <div className="inquiry-form-card">
            <form id="inquiry-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="e.g. Alexander Nair"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="e.g. alexander@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="projectType">
                    Project Discipline
                  </label>
                  <select
                    id="projectType"
                    className="form-select"
                    value={formData.projectType}
                    onChange={handleChange}
                  >
                    <option value="turnkey">Turnkey Luxury Residence</option>
                    <option value="architectural">Architectural Execution</option>
                    <option value="renovation">Renovation & Retrofit</option>
                    <option value="interior">Interior Architecture & Millwork</option>
                    <option value="commercial">Commercial / Institutional</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Proposed Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="form-input"
                    placeholder="e.g. Kochi, Kerala"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="area">
                    Estimated Built Area
                  </label>
                  <input
                    type="text"
                    id="area"
                    className="form-input"
                    placeholder="e.g. 6,500 Sq. Ft."
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="brief">
                    Architectural Brief / Scope
                  </label>
                  <textarea
                    id="brief"
                    className="form-textarea"
                    placeholder="Describe your site, architectural vision, timeline requirements, and project scope..."
                    value={formData.brief}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="form-submit-btn"
                disabled={formState === 'transmitting'}
                style={
                  formState === 'transmitted'
                    ? { backgroundColor: '#22c55e', color: '#08090a' }
                    : undefined
                }
              >
                <span>
                  {formState === 'idle' && 'Initiate Consultation Request'}
                  {formState === 'transmitting' && 'Transmitting Consultation Request...'}
                  {formState === 'transmitted' && 'Request Transmitted · Studio Will Connect'}
                </span>
                <span>→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
