import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Star,
  Moon,
  Zap,
  Orbit,
  Component,
  Play,
  SkipForward,
  SkipBack,
} from "lucide-react";
import "../../styles/sections/ProjectsSection.scss";
import baseballImg from "../../assets/images/BaseballLive.png";
import flutterImg from "../../assets/images/VrijeTeid.png";

const projects = [
  {
    id: 1,
    title: "BaseballLive",
    subtitle: "Blazor • SignalR • C#",
    description: "Real-time match updates using SignalR websockets.",
    image: baseballImg,
    color: "#ffbd7a",
    year: "2024",
    context: "SOLO PROJECT",
  },
  {
    id: 2,
    title: "Vrije Teid!",
    subtitle: "Flutter • Dart • Firebase",
    description: "Mobile application for community activity management.",
    image: flutterImg,
    color: "#a5f3fc",
    year: "2024",
    context: "GROUP EFFORT",
  },
  {
    id: 3,
    title: "Search Infrastructure",
    subtitle: "OpenSearch • Docker",
    description: "Internal project optimizing large-scale data retrieval.",
    isClassified: true,
    color: "#e9d5ff",
    year: "2025",
    context: "INTERNSHIP",
  },
];

const ProjectsSection = ({ id }) => {
  const doodleField = useMemo(() => {
    const icons = [Music, Star, Moon, Zap, Orbit, Component];
    const colors = ["#a5f3fc", "#e9d5ff", "#ffbd7a"];

    return [...Array(12)].map((_, i) => {
      const zones = [
        { t: [5, 15], l: [5, 15] },
        { t: [5, 15], l: [85, 95] },
        { t: [40, 60], l: [2, 8] },
        { t: [40, 60], l: [92, 98] },
        { t: [80, 90], l: [10, 20] },
        { t: [80, 90], l: [80, 90] },
      ];
      const zone = zones[i % zones.length];
      const clr = colors[Math.floor(Math.random() * colors.length)];
      return {
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        top: `${zone.t[0] + Math.random() * (zone.t[1] - zone.t[0])}%`,
        left: `${zone.l[0] + Math.random() * (zone.l[1] - zone.l[0])}%`,
        size: Math.random() * 7 + 10,
        color: clr,
        textShadow: `0 0 12px white, 0 0 6px ${clr}`,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 5,
      };
    });
  }, []);

  const stars = useMemo(() => {
  return [...Array(300)].map((_, i) => {
    const size = i % 10 === 0 ? 3 : i % 5 === 0 ? 2 : 1; // 80% is maar 1px
    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${size}px`,
      duration: Math.random() * 3 + 2 + "s",
      delay: Math.random() * 5 + "s",
      // Maak de kleinste sterren minder zichtbaar voor diepte
      opacity: size === 1 ? Math.random() * 0.3 + 0.1 : Math.random() * 0.5 + 0.3,
      blur: i % 15 === 0 ? "1px" : "0px"
    };
  });
}, []);

  return (
    <section id={id} className="projects-section">
      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              "--duration": star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {doodleField.map((d) => (
        <motion.div
          key={d.id}
          className="sparkle-doodle"
          initial={{ opacity: 0.18, scale: 0.7 }}
          animate={{
            opacity: [0.18, 0.6, 0.18],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: d.duration,
            repeat: Infinity,
            delay: d.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: d.top,
            left: d.left,
            color: d.color,
            filter: `drop-shadow(0 0 8px ${d.color})`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <d.Icon size={d.size} strokeWidth={2.1} />
        </motion.div>
      ))}

      <div className="section-content">
        <motion.div className="section-header">
          <h2 className="section-title">
            <span className="title-glow">My Projects</span>
          </h2>
          <div className="title-underline"></div>
        </motion.div>

        <motion.div className="projects-container">
          {projects.map((project) => (
            <motion.div key={project.id} className="music-card">
              <div className="card-hardware">
                {" "}
                <div className="album-art">
                  {project.isClassified ? (
                    <div className="classified-overlay">
                      <span>CLASSIFIED</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="art-img"
                      />
                      <div className="screen-glare"></div>{" "}
                    </>
                  )}
                </div>
                <div className="card-info">
                  <h3 className="project-name">{project.title}</h3>

                  <div className="project-tech-stack">
                    {project.subtitle.split(" • ").map((tech) => (
                      <span
                        key={tech}
                        className="tech-tag"
                        style={{ color: project.color }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <p className="project-desc">{project.description}</p>
                </div>
                <div className="playback-unit">
                  <div className="playback-bar">
                    <div className="progress-bg">
                      <motion.div
                        className="progress-fill"
                        style={{
                          backgroundColor: project.color,
                          boxShadow: `0 0 10px ${project.color}`,
                        }}
                      />
                    </div>
                    <div className="time-info">
                      <span>{project.context}</span>
                      <span>{project.year}</span>
                    </div>
                  </div>

                  <div className="player-controls">
                    <SkipBack size={18} />
                    <div
                      className="main-play-btn"
                      style={{ backgroundColor: project.color }}
                    >
                      <Play size={18} fill="#1a1a2e" color="#1a1a2e" />
                    </div>
                    <SkipForward size={18} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="audio-visualizer">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="bar"
            animate={{ height: [5, 30, 15, 35, 5] }}
            transition={{
              repeat: Infinity,
              duration: 1 + Math.random(),
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;