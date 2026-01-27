import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import "../../styles/sections/SkillsSection.scss";
import sakuraTree from "../../assets/images/sakura2.png";
import petalImg from "../../assets/images/petal.png";

// 1. EENVOUDIGE STER (Achtergrond, beweegt nauwelijks, focus op aantal)
const Star = () => {
  const style = useMemo(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 2}px`,
    height: `${Math.random() * 2}px`,
    opacity: Math.random() * 0.7 + 0.3,
    animationDelay: `${Math.random() * 5}s`,
  }), []);

  return <div className="star-static" style={style} />;
};

// 2. REALISTISCHE VALLENDE PETAL
const FallingPetal = () => {
  const settings = useMemo(() => ({
    left: Math.random() * 100,
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 20,
    scale: 0.3 + Math.random() * 0.7, 
    drift: (Math.random() - 0.5) * 100, 
  }), []);

  return (
    <motion.img
      src={petalImg}
      className="sakura-petal-real"
      style={{ 
        left: `${settings.left}%`, 
        scale: settings.scale,
        filter: `brightness(${0.7 + Math.random() * 0.5})`
      }}
      initial={{ y: -50, opacity: 0, rotate: 0, rotateX: 0, rotateY: 0 }}
      animate={{
        y: "110vh", 
        opacity: [0, 1, 1, 0], 
        x: [0, settings.drift, -settings.drift / 2, settings.drift, 0], 
        rotate: [0, 360 + Math.random() * 180], 
        rotateX: [0, 180, 360], 
        rotateY: [0, 180, 360],
      }}
      transition={{
        duration: settings.duration,
        repeat: Infinity,
        delay: settings.delay,
        ease: "linear",
      }}
    />
  );
};


const SkillsSection = () => {
  const { t } = useTranslation();
  const stars = useMemo(() => Array.from({ length: 250 }), []);
  const petals = useMemo(() => Array.from({ length: 20 }), []);

  const skillGroups = useMemo(() => [
    {
      id: "languages",
      title: t('skills_categories.languages'),
      skills: [
        "C#", "Python", "JavaScript", "TypeScript", "Dart", "SQL",
      ]
    },
    {
      id: "backend",
      title: t('skills_categories.backend'),
      skills: [
        ".NET", "ASP.NET MVC", "REST APIs", "SignalR", "OpenSearch",
      ]
    },
    {
      id: "frontend",
      title: t('skills_categories.frontend'),
      skills: [
        "React", "Three.js", "HTML", "CSS", "Tailwind CSS", "Blazor",
      ]
    },
    {
      id: "mobile-desktop",
      title: t('skills_categories.mobile_desktop'),
      skills: [
        ".NET MAUI", "Flutter", "WPF",
      ]
    },
    {
      id: "devops",
      title: t('skills_categories.devops'),
      skills: [
        "Docker", "Linux", "Virtual Machines",
      ]
    },
    {
      id: "tooling",
      title: t('skills_categories.tooling'),
      skills: [
        "Git", "GitHub", "GitLab", "Postman",
      ]
    },
  ], [t]); 

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="skills-section">
      {/* 1. ACHTERGROND */}
      <div className="background-elements">
        <div className="nebula-bg" />
        <div className="cosmic-dust" />
        {stars.map((_, i) => <Star key={`star-${i}`} />)}
      </div>

      {/* 2. BOMEN & PETALS */}
      <div className="trees-layer">
        <div className="tree-wrapper left">
          <img src={sakuraTree} alt="Sakura" className="tree-img" />
        </div>
        <div className="tree-wrapper right">
          <img src={sakuraTree} alt="Sakura" className="tree-img" />
        </div>
      </div>

      <div className="petals-layer">
        {petals.map((_, i) => <FallingPetal key={`petal-${i}`} />)}
      </div>

      {/* 3. CONTENT */}
      <motion.div
        className="content-wrapper"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <header className="header-container">
          <motion.h2 className="main-title" variants={itemVariants}>
            {t('skills')}
          </motion.h2>
          <motion.div className="title-underline" variants={itemVariants} />
        </header>

        <div className="skills-grid">
          {skillGroups.map((group) => (
            <motion.div
              key={group.id}
              className="skill-category-card"
              variants={itemVariants}
            >
              <h3>{group.title}</h3>
              <div className="skill-tags">
                {group.skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SkillsSection;