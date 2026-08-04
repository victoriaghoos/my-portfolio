
import React from 'react';
import AboutSection from './AboutSection';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';
import ResumeSection from './ResumeSection';
import SocialsSection from './SocialsSection';

const SectionsContainer = () => {
  return (
    <div className="sections-container">
      <AboutSection id="about-section" />
      <SkillsSection id="skills-section" />
      <ProjectsSection id="projects-section" />
      <ResumeSection id="resume-section" />
      <SocialsSection id="socials-section" />
    </div>
  );
};

export default SectionsContainer;