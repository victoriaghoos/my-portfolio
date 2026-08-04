
import React, { Suspense, lazy } from 'react';

const AboutSection = lazy(() => import('./AboutSection'));
const ProjectsSection = lazy(() => import('./ProjectsSection'));
const SkillsSection = lazy(() => import('./SkillsSection'));
const ResumeSection = lazy(() => import('./ResumeSection'));
const SocialsSection = lazy(() => import('./SocialsSection'));

const SectionsContainer = () => {
  const sectionFallback = <div className="section-placeholder" aria-hidden="true" />;

  return (
    <div className="sections-container">
      <Suspense fallback={sectionFallback}>
        <AboutSection id="about-section" />
      </Suspense>
      <Suspense fallback={sectionFallback}>
        <SkillsSection id="skills-section" />
      </Suspense>
      <Suspense fallback={sectionFallback}>
        <ProjectsSection id="projects-section" />
      </Suspense>
      <Suspense fallback={sectionFallback}>
        <ResumeSection id="resume-section" />
      </Suspense>
      <Suspense fallback={sectionFallback}>
        <SocialsSection id="socials-section" />
      </Suspense>
    </div>
  );
};

export default SectionsContainer;