import React, { useState } from 'react';
import { SITE_CONTENT } from '../data/content';

const FORMSPREE_ENDPOINT =
  (import.meta.env.VITE_FORMSPREE_ENDPOINT as string) ||
  'https://formspree.io/f/mnpjqyee';

export const ContactSection: React.FC = () => {
  const { contact } = SITE_CONTENT;
  const [formState, setFormState] = useState<'idle' | 'transmitting' | 'transmitted' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'turnkey',
    location: '',
    area: '',
    brief: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState === 'transmitting') return;

    setFormState('transmitting');
    setErrorMessage('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          'Full Name': formData.name,
          'Email Address': formData.email,
          'Phone Number': formData.phone || 'Not provided',
          'Project Discipline': formData.projectType,
          'Proposed Location': formData.location || 'Not provided',
          'Estimated Built Area': formData.area || 'Not provided',
          'Architectural Brief / Scope': formData.brief || 'Not provided',
          _subject: `New Architectural Inquiry from ${formData.name} — M & M Constructions`,
        }),
      });

      if (response.ok) {
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
        setTimeout(() => {
          setFormState('idle');
        }, 6000);
      } else {
        const data = await response.json().catch(() => null);
        const errorText =
          data?.errors?.map((err: { message: string }) => err.message).join(', ') ||
          'Unable to transmit request. Please verify your details or contact us directly.';
        setErrorMessage(errorText);
        setFormState('error');
      }
    } catch {
      setErrorMessage('Network connection error. Please check your connection or call us directly.');
      setFormState('error');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (formState === 'error') {
      setFormState('idle');
      setErrorMessage('');
    }
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
                  <div className="contact-phone-list">
                    {(contact.details.phones || [contact.details.phone]).map((phoneNum) => (
                      <a
                        key={phoneNum}
                        href={`tel:${phoneNum.replace(/\s+/g, '')}`}
                        className="contact-item-value contact-item-link"
                      >
                        {phoneNum}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="contact-direct-item">
                  <span className="contact-item-label">Studio Email</span>
                  <a
                    href={`mailto:${contact.details.email}`}
                    className="contact-item-value contact-item-link"
                  >
                    {contact.details.email}
                  </a>
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
                    name="name"
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
                    name="email"
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
                    name="phone"
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
                    name="projectType"
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
                    name="location"
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
                    name="area"
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
                    name="brief"
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
                    : formState === 'error'
                    ? { backgroundColor: '#b91c1c', color: '#ffffff' }
                    : undefined
                }
              >
                <span>
                  {formState === 'idle' && 'Initiate Consultation Request'}
                  {formState === 'transmitting' && 'Transmitting Consultation Request...'}
                  {formState === 'transmitted' && 'Request Transmitted · Studio Will Connect'}
                  {formState === 'error' && 'Transmission Failed · Click to Retry'}
                </span>
                <span>{formState === 'transmitting' ? '⏳' : formState === 'transmitted' ? '✓' : '→'}</span>
              </button>

              {formState === 'error' && errorMessage && (
                <div
                  style={{
                    marginTop: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#f87171',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderLeft: '2px solid #ef4444',
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                  }}
                >
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
