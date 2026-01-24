import React, { useMemo } from "react";
import { motion } from "framer-motion";
import "../../styles/sections/SkillsSection.scss";
import sakuraTree from "../../assets/images/sakura2.png";

// STABIELE STER COMPONENT
const Star = () => {
  const style = useMemo(() => {
    const colors = ["#ffffff", "#e0f2ff", "#ffddee"]; 
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 0.5}px`,
      height: `${Math.random() * 2 + 0.5}px`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random(),
    };
  }, []);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none star-particle"
      style={style}
      animate={{ 
        opacity: [0.2, 0.8, 0.2], 
        scale: [1, 1.2, 1],
      }}
      transition={{ 
        duration: 3 + Math.random() * 4, 
        repeat: Infinity,
        ease: "linear" 
      }}
    />
  );
};

// NIEUW: STABIELE STARDUST COMPONENT
// Dit voorkomt dat ze verspringen bij muisbewegingen
const StardustParticle = () => {
  const settings = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    drift: (Math.random() - 0.5) * 15, // Horizontale afwijking
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 10,
    size: Math.random() * 2 + 1
  }), []);

  return (
    <motion.div
      className="stardust"
      initial={{ y: "-10vh", x: "0vw", opacity: 0 }}
      animate={{ 
        y: "110vh", 
        x: `${settings.drift}vw`,
        opacity: [0, 0.7, 0] 
      }}
      transition={{ 
        duration: settings.duration, 
        repeat: Infinity, 
        ease: "linear",
        delay: settings.delay
      }}
      style={{
        left: settings.left,
        width: `${settings.size}px`,
        height: `${settings.size}px`
      }}
    />
  );
};

const SkillsSection = () => {
  const stars = Array.from({ length: 80 });
  const stardust = Array.from({ length: 25 });
  
  const skillGroups = [
    { id: "core", title: "Backend & Systems", skills: ["C#", ".NET", "Python", "SQL", "Java", "Linux"] },
    { id: "front", title: "Frontend & Design", skills: ["React", "Three.js", "TypeScript", "Tailwind", "Blazor"] },
    { id: "tools", title: "DevOps & Mobile", skills: [".NET MAUI", "Flutter", "Docker", "Git", "Postman", "SignalR"] },
  ];

  return (
    <section className="skills-section">
      <div className="background-elements">
        <div className="nebula-deep-blue" />
        <div className="nebula-magenta" />
        {stars.map((_, i) => <Star key={`star-${i}`} />)}
        {stardust.map((_, i) => <StardustParticle key={`dust-${i}`} />)}
      </div>

      <div className="trees-layer">
        <div className="tree-wrapper left">
          <img src={sakuraTree} alt="Sakura Left" className="tree-img" />
        </div>
        <div className="tree-wrapper right">
          <img src={sakuraTree} alt="Sakura Right" className="tree-img" />
        </div>
      </div>

      <header className="header-container">
        <motion.h2 className="main-title">SKILLS</motion.h2>
      </header>

      <div className="skills-grid">
        {skillGroups.map((group, index) => (
          <motion.div key={group.id} className="skill-category-card">
            <h3>{group.title}</h3>
            <div className="skill-tags">
              {group.skills.map((skill) => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;