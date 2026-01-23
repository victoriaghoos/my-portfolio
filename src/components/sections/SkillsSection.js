import React from "react";
import { motion } from "framer-motion";
import "../../styles/sections/SkillsSection.scss";
import sakuraTree from "../../assets/images/sakura2.png";

// ... (Houd je skillClusters en floatAnimation hier hetzelfde als eerst) ...
const skillClusters = [
  {
    category: "The Core (Backend & Languages)",
    skills: ["C#", ".NET", "Python", "SQL", "Java", "Linux"],
  },
  {
    category: "The Interface (Frontend)",
    skills: ["React", "Three.js", "JS/TS", "HTML/CSS", "Tailwind", "Blazor"],
  },
  {
    category: "The Ecosystem (Mobile & Tools)",
    skills: [
      ".NET MAUI",
      "Flutter/Dart",
      "Docker",
      "Git/GitHub",
      "Postman",
      "SignalR",
    ],
  },
];

const floatAnimation = {
  initial: { y: 0 },
  animate: (i) => ({
    y: [0, -10, 0],
    transition: {
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 2,
    },
  }),
};

// ... (Houd je Petal component hier hetzelfde) ...
const Petal = () => {
    const randomX = Math.random() * 100;
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * 5;
    return (
        <motion.div
            className="sakura-petal"
            initial={{ y: -100, x: `${randomX}vw`, opacity: 0, rotate: 0 }}
            animate={{
                y: "110vh",
                x: `${randomX + (Math.random() * 10 - 5)}vw`,
                opacity: [0, 1, 0],
                rotate: 360,
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
            }}
        />
    );
};

const SkillsSection = () => {
  const petals = Array.from({ length: 30 }); // Iets meer blaadjes voor het effect

  return (
    <section className="skills-section">
      {/* 1. Background Glow (Centraal) */}
      <div className="cosmic-glow" />

      {/* 2. De Bomen (Images i.p.v. SVG) */}
      <div className="trees-layer">
        {/* Linker Boom */}
        <div className="tree-wrapper left">
             {/* Vervang src door je eigen lokale image: /assets/sakura-tree.png */}
            <img src={sakuraTree} alt="Sakura Left" className="tree-img" />
        </div>
        
        {/* Rechter Boom (We spiegelen deze met CSS) */}
        <div className="tree-wrapper right">
            <img src={sakuraTree} alt="Sakura Right" className="tree-img" />
        </div>
      </div>

      {/* 3. Falling Petals */}
      <div className="petals-container">
        {petals.map((_, index) => (
          <Petal key={index} />
        ))}
      </div>

      {/* 4. Content */}
      <div className="skills-content">
        <h2 className="section-title">Technical <span className="highlight">Arsenal</span></h2>
        
        <div className="clusters-grid">
          {skillClusters.map((cluster, clusterIndex) => (
            <div key={clusterIndex} className="cluster-group">
              <h3 className="cluster-title">{cluster.category}</h3>
              <div className="tags-wrapper">
                {cluster.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill}
                    className="skill-tag"
                    custom={skillIndex}
                    variants={floatAnimation}
                    initial="initial"
                    animate="animate"
                    whileHover={{ scale: 1.1, borderColor: "#ff69b4", boxShadow: "0 0 15px #ff00cc" }}
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;