import React, { useMemo, memo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from 'react-i18next';
import "../../styles/sections/SkillsSection.scss";
import sakuraTree from "../../assets/images/sakura2.png";
import petalImg from "../../assets/images/petal.png";
import {
  SiPython, SiJavascript, SiTypescript, SiPhp,
  SiDotnet, SiNodedotjs, SiOpensearch, SiBlazor, SiLaravel,
  SiReact, SiThreedotjs, SiHtml5, SiCss3, SiTailwindcss, SiVuedotjs, SiSass,
  SiDocker, SiLinux, SiKubernetes, SiTerraform,
  SiGit, SiGithub, SiGitlab, SiPostman, SiSwagger,
} from "react-icons/si";
import { BsDatabase } from "react-icons/bs";
import { TbApi, TbBrandAzure } from "react-icons/tb";

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


const SkillsSection = ({ id }) => {
  const { t } = useTranslation();
  const petalsRef = useRef(null);
  const isPetalsInView = useInView(petalsRef, { once: false, amount: 0.1 });
  
  const stars = useMemo(() => Array.from({ length: 150 }), []);
  const petals = useMemo(() => Array.from({ length: 12 }), []);

  const skillGroups = useMemo(() => [
    {
      id: "languages",
      title: t('skills_categories.languages'),
      featured: true,
      accent: "#f0a8d0",
      skills: [
        { name: "C#",          icon: null },
        { name: "Python",      icon: SiPython },
        { name: "JavaScript",  icon: SiJavascript },
        { name: "TypeScript",  icon: SiTypescript },
        { name: "SQL",         icon: BsDatabase },
        { name: "PHP",         icon: SiPhp },
      ],
    },
    {
      id: "backend",
      title: t('skills_categories.backend'),
      featured: true,
      accent: "#d295d6",
      skills: [
        { name: ".NET",        icon: SiDotnet },
        { name: "ASP.NET MVC", icon: null },
        { name: "Laravel",     icon: SiLaravel },
        { name: "REST APIs",   icon: TbApi },
        { name: "SignalR",     icon: null },
        { name: "OpenSearch",  icon: SiOpensearch },
        { name: "Node.js",     icon: SiNodedotjs },
        { name: "EF Core",     icon: null },
        { name: "JWT",         icon: null },
      ],
    },
    {
      id: "frontend",
      title: t('skills_categories.frontend'),
      accent: "#bb95e0",
      skills: [
        { name: "React",        icon: SiReact },
        { name: "Three.js",     icon: SiThreedotjs },
        { name: "HTML",         icon: SiHtml5 },
        { name: "CSS",          icon: SiCss3 },
        { name: "Tailwind CSS", icon: SiTailwindcss },
        { name: "Vue.js",       icon: SiVuedotjs },
        { name: "SCSS",         icon: SiSass },
        { name: "Blazor",       icon: SiBlazor },
        { name: ".NET MAUI",    icon: null },
        { name: "WPF",          icon: null },
      ],
    },
    {
      id: "devops",
      title: t('skills_categories.devops'),
      accent: "#a68ee6",
      skills: [
        { name: "Docker",           icon: SiDocker },
        { name: "Kubernetes",       icon: SiKubernetes },
        { name: "Linux",            icon: SiLinux },
        { name: "Virtual Machines", icon: null },
        { name: "CI/CD",            icon: null },
        { name: "Terraform",        icon: SiTerraform },
        { name: "Azure",            icon: TbBrandAzure },
      ],
    },
    {
      id: "tooling",
      title: t('skills_categories.tooling'),
      accent: "#9490ea",
      skills: [
        { name: "Git",     icon: SiGit },
        { name: "GitHub",  icon: SiGithub },
        { name: "GitLab",  icon: SiGitlab },
        { name: "Postman", icon: SiPostman },
        { name: "Swagger", icon: SiSwagger },
      ],
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
    <section id={id} className="skills-section">
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

      <div className="petals-layer" ref={petalsRef}>
        {isPetalsInView && petals.map((_, i) => <FallingPetal key={`petal-${i}`} />)}
      </div>

      {/* 3. CONTENT */}
      <motion.div
        className="content-wrapper"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ 
          once: false,   
          amount: 0.3   
        }}
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
              className={`skill-category-card${group.featured ? ' featured' : ''}`}
              style={{ '--accent': group.accent }}
              variants={itemVariants}
            >
              <h3>{group.title}</h3>
              <div className="skill-tags">
                {group.skills.map(({ name, icon: Icon }) => (
                  <span key={name} className="tag">
                    {Icon && <Icon className="tag-icon" aria-hidden="true" />}
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default memo(SkillsSection);