export interface Stage {
  threshold: number;
  text: string;
  label: string;
}

export interface Service {
  name: string;
  description: string;
}

export interface Project {
  n: string;
  loc: string;
  type: string;
  d: string;
  scope: string[];
  det: string;
}

export interface Principle {
  title: string;
  description: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ContactInfo {
  [key: string]: string;
}

export interface SiteContent {
  stages: Stage[];
  about: string[];
  services: Service[];
  projects: Project[];
  principles: Principle[];
  process: ProcessStep[];
  contact: ContactInfo;
  whatsappNumber: string;
}

export const content: SiteContent = {
  stages: [
    { threshold: 0, text: 'The site awaits.', label: 'SITE' },
    { threshold: 0.10, text: 'Grounded in precision.', label: 'FOUNDATION' },
    { threshold: 0.20, text: 'Rising with purpose.', label: 'STRUCTURE' },
    { threshold: 0.35, text: 'Shaping the space.', label: 'FLOORS & WALLS' },
    { threshold: 0.50, text: 'Defining the form.', label: 'ROOF' },
    { threshold: 0.60, text: 'Enclosing the vision.', label: 'ENVELOPE' },
    { threshold: 0.70, text: 'Character in detail.', label: 'FACADE' },
    { threshold: 0.78, text: 'Warmth within.', label: 'INTERIOR' },
    { threshold: 0.86, text: 'Nature completes.', label: 'LANDSCAPE' },
    { threshold: 0.94, text: 'Built to last.', label: 'COMPLETE' },
  ],
  about: [
    "[Company story: add M & M Constructions' founding story here.]",
    '[Add what the company builds, and the values behind how it works.]',
    '[Add team, region and approach. Facts to be supplied by M & M.]',
  ],
  services: [
    { name: 'Residential Construction', description: '[Add description. Scene: modern house.]' },
    { name: 'Commercial Construction', description: '[Add description. Scene: commercial structure.]' },
    { name: 'Renovation & Remodeling', description: '[Add description. Scene: structure shown mid-transformation.]' },
    { name: 'Interior & Finishing', description: '[Add description. Scene: inside the building.]' },
    { name: 'Project Management', description: '[Add description. Scene: architectural plan.]' },
  ],
  projects: [
    { n: 'Project One', loc: '[Location]', type: '[Project type]', d: '[Add project description.]', scope: ['[Scope item]', '[Scope item]', '[Scope item]'], det: '[Add construction details: materials, method, timeline.]' },
    { n: 'Project Two', loc: '[Location]', type: '[Project type]', d: '[Add project description.]', scope: ['[Scope item]', '[Scope item]', '[Scope item]'], det: '[Add construction details: materials, method, timeline.]' },
    { n: 'Project Three', loc: '[Location]', type: '[Project type]', d: '[Add project description.]', scope: ['[Scope item]', '[Scope item]', '[Scope item]'], det: '[Add construction details: materials, method, timeline.]' },
  ],
  principles: [
    { title: 'Precision', description: '[Add a line on how precision shows up in your work.]' },
    { title: 'Craftsmanship', description: '[Add a line on craftsmanship.]' },
    { title: 'Transparency', description: '[Add a line on transparency.]' },
    { title: 'Attention to Detail', description: '[Add a line on detail.]' },
    { title: 'Reliability', description: '[Add a line on reliability.]' },
  ],
  process: [
    { title: 'Consultation', description: 'Listen to the idea, the site and the budget.' },
    { title: 'Planning', description: 'Shape scope, schedule and permits.' },
    { title: 'Design & Estimation', description: 'Drawings and a clear estimate.' },
    { title: 'Construction', description: 'Foundation to frame to envelope.' },
    { title: 'Finishing', description: 'Interiors, fittings and final details.' },
    { title: 'Handover', description: 'Walk-through and keys.' },
  ],
  contact: {
    Phone: '[Add phone]',
    WhatsApp: '[Add WhatsApp]',
    Email: '[Add email]',
    Location: '[Add location]',
    'Business hours': '[Add hours]',
  },
  whatsappNumber: '',
};
