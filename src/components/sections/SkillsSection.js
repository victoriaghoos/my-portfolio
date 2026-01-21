import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, Globe, Wrench, Sparkles, Layers } from 'lucide-react';
import '../../styles/sections/SkillsSection.scss';

const skillPetals = [
  { title: "Backend", icon: <Cpu size={18} />, skills: ["C#", ".NET", "Python", "SQL", "MVC"], color: "#8AE6FF", angle: -60 },
  { title: "Frontend", icon: <Layers size={18} />, skills: ["React", "TS", "JS", "Blazor", "SCSS"], color: "#A78BFA", angle: -30 },
  { title: "DevOps", icon: <Wrench size={18} />, skills: ["Docker", "Linux", "Git", "APIs", "Postman"], color: "#C084FC", angle: 0 },
  { title: "Environment", icon: <Sparkles size={18} />, skills: ["VS Code", "Visual Studio", "Ryder", "Flutter"], color: "#FF77C6", angle: 30 },
  { title: "Languages", icon: <Globe size={18} />, skills: ["NL (Native)", "EN (C2)", "FR (B2)", "JP (N4)"], color: "#F472B6", angle: 60 }
];

const SkillsSection = ({ id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} ref={sectionRef} className="skills-section">
      <div className="section-content">
        <header className="section-header">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            className="section-title"
          >
            <span className="title-glow">Skills Bloom</span>
          </motion.h2>
          <p className="section-subtitle">A cosmic garden of technical growth</p>
        </header>

        <div className="flower-display">
          <motion.div 
            className="flower-heart"
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Code2 size={32} className="heart-icon" />
            <div className="pulse-ring"></div>
          </motion.div>

          <div className="petals-container">
            {skillPetals.map((petal, idx) => (
              <div key={idx} className="petal-axis" style={{ transform: `rotate(${petal.angle}deg)` }}>
                <motion.div 
                  className="petal-card"
                  initial={{ opacity: 0, scale: 0, y: 0, rotate: 0 }}
                  animate={isVisible ? { 
                    opacity: 1, 
                    scale: 1, 
                    y: -280, // Duwt ze naar buiten
                    rotate: -petal.angle // Zet de tekst weer recht
                  } : {}}
                  transition={{ 
                    delay: 0.4 + (idx * 0.1), 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 40 
                  }}
                  style={{ '--petal-color': petal.color }}
                >
                  <div className="petal-glass"></div>
                  <div className="petal-header">
                    {petal.icon}
                    <h3>{petal.title}</h3>
                  </div>
                  <div className="tag-cloud">
                    {petal.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;