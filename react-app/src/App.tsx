import React, { useState, useCallback } from 'react';
import { ProjectItem } from './types';
import { Preloader } from './components/Preloader';
import { SiteHeader } from './components/SiteHeader';
import { MobileDrawer } from './components/MobileDrawer';
import { CinematicSection } from './components/CinematicSection';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ProcessSection } from './sections/ProcessSection';
import { ContactSection } from './sections/ContactSection';
import { SiteFooter } from './sections/SiteFooter';
import { ProjectModal } from './components/ProjectModal';

export const App: React.FC = () => {
  const [isPreloaderLoaded, setIsPreloaderLoaded] = useState<boolean>(false);
  const [preloaderProgress, setPreloaderProgress] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const handleBufferProgress = useCallback((percent: number) => {
    setPreloaderProgress(percent);
  }, []);

  const handleInitialReady = useCallback(() => {
    setTimeout(() => {
      setIsPreloaderLoaded(true);
    }, 200);
  }, []);

  return (
    <>
      {/* Initial Architectural Preloader */}
      <Preloader progress={preloaderProgress} isLoaded={isPreloaderLoaded} />

      {/* Floating Navigation Header */}
      <SiteHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Primary Cinematic Canvas Experience */}
      <CinematicSection
        onInitialReady={handleInitialReady}
        onBufferProgress={handleBufferProgress}
      />

      {/* Section 01: About Practice */}
      <AboutSection />

      {/* Section 02: Services & Disciplines */}
      <ServicesSection />

      {/* Section 03: Projects Showcase */}
      <ProjectsSection onSelectProject={(project) => setSelectedProject(project)} />

      {/* Section 04: Execution Process */}
      <ProcessSection />

      {/* Section 05: Contact & Consultation */}
      <ContactSection />

      {/* Footer */}
      <SiteFooter />

      {/* Project Specification Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
};

export default App;
