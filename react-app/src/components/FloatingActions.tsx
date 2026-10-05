import React, { useEffect, useState } from 'react';

const CALL_PHONE_NUMBER = '+917012495244';
const WHATSAPP_NUMBER = '918078807927';
const WHATSAPP_MESSAGE = "Hi! I'd like to know more about the architectural services offered by M & M Constructions.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const FloatingActions: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const cinematicSection = document.getElementById('cinematic-section');
      if (cinematicSection) {
        const rect = cinematicSection.getBoundingClientRect();
        // Visible only when scrolled past the cinematic hero frames view
        setIsVisible(rect.bottom <= window.innerHeight * 0.6);
      } else {
        setIsVisible(window.scrollY > 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`floating-actions-dock ${isVisible ? 'visible' : ''}`}
      role="region"
      aria-label="Quick contact actions"
    >
      {/* Direct Phone Call Button */}
      <a
        href={`tel:${CALL_PHONE_NUMBER}`}
        className="float-action-btn float-call-btn"
        aria-label="Call M & M Constructions (+91 70124 95244)"
        title="Call M & M (+91 70124 95244)"
      >
        <span className="float-pulse call-pulse" />
        <svg
          className="float-action-icon"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
        <span className="float-badge-label">Call M &amp; M</span>
      </a>

      {/* WhatsApp Quick Chat Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="float-action-btn float-whatsapp-btn"
        aria-label="Chat with M & M Constructions on WhatsApp"
        title="Chat on WhatsApp (+91 8078807927)"
      >
        <span className="float-pulse whatsapp-pulse" />
        <svg
          className="float-action-icon"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.64.764 5.103 2.08 7.185L3 29l6.02-1.54A13.43 13.43 0 0 0 16 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5zm7.845 19.063c-.328.924-1.624 1.768-2.656 1.992-.705.152-1.625.274-4.73-1.014-3.968-1.646-6.526-5.674-6.724-5.937-.197-.263-1.611-2.146-1.611-4.093 0-1.947 1.019-2.905 1.38-3.3.362-.395.789-.494 1.052-.494.263 0 .526.002.756.014.242.012.566-.092.887.678.328.79 1.117 2.73 1.215 2.928.098.197.164.428.033.69-.131.263-.197.428-.394.658-.197.23-.414.512-.592.688-.197.197-.403.411-.173.805.23.395 1.021 1.688 2.191 2.73 1.507 1.342 2.777 1.758 3.172 1.955.395.197.624.164.854-.099.23-.263.986-1.15 1.249-1.545.263-.395.526-.328.887-.197.361.131 2.298 1.084 2.692 1.281.394.197.657.296.756.46.098.164.098.954-.23 1.878z" />
        </svg>
        <span className="float-badge-label">Chat on WhatsApp</span>
      </a>
    </div>
  );
};
