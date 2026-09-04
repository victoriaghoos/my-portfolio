import { Suspense, lazy } from 'react';

const AboutSection = lazy(() => import('./AboutSection'));
const ProjectsSection = lazy(() => import('./ProjectsSection'));
const SkillsSection = lazy(() => import('./SkillsSection'));
const ResumeSection = lazy(() => import('./ResumeSection'));
const SocialsSection = lazy(() => import('./SocialsSection'));

const SectionsContainer = () => {
  return (
    <div className="sections-container">
      <Suspense fallback={<div className="section-placeholder" />}>
        <AboutSection id="about-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <SkillsSection id="skills-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <ProjectsSection id="projects-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <ResumeSection id="resume-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <SocialsSection id="socials-section" />
      </Suspense>
    </div>
  );
};

export default SectionsContainer;
