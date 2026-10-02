export interface BrandInfo {
  name: string;
  shortName: string;
  tagline: string;
  subtagline: string;
  discipline: string;
  coordinates: string;
  elevation: string;
  status: string;
}

export interface CinematicStage {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  frameStart: number;
  frameEnd: number;
  description: string;
}

export interface CinematicConfig {
  totalFrames: number;
  fps: number;
  resolution: string;
  aspectRatio: number;
  frameBaseUrl?: string;
  stages: CinematicStage[];
}

export interface Pillar {
  number: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface AboutContent {
  badge: string;
  headline: string;
  lead: string;
  paragraphs: string[];
  pillars: Pillar[];
}

export interface ServiceItem {
  number: string;
  id: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  focus: string;
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  category: string;
  location: string;
  area: string;
  year: string;
  status: string;
  overview: string;
  scope: string[];
  highlights: string[];
  specs: ProjectSpec[];
}

export interface ProcessStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
}

export interface ContactDetails {
  phone: string;
  email: string;
  location: string;
  hours: string;
}

export interface ContactContent {
  badge: string;
  headline: string;
  lead: string;
  details: ContactDetails;
  note: string;
}

export interface FooterContent {
  brand: string;
  tagline: string;
  copyright: string;
  disclaimer: string;
}

export interface SiteContent {
  brand: BrandInfo;
  cinematic: CinematicConfig;
  about: AboutContent;
  services: ServiceItem[];
  projects: ProjectItem[];
  process: ProcessStep[];
  contact: ContactContent;
  footer: FooterContent;
}
