
import React from 'react';
import AboutSection from './AboutSection.js';
import ProjectsSection from './ProjectsSection.js';
import SkillsSection from './SkillsSection.js';
import ResumeSection from './ResumeSection.js';
import SocialsSection from './SocialsSection.js';

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