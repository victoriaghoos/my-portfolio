import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Music, Star, Sparkles, Moon, Heart, ShieldAlert, Play, SkipForward, SkipBack, Share2 } from "lucide-react";
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
  },
  {
    id: 2,
    title: "Vrije Teid!",
    subtitle: "Flutter • Dart • Firebase",
    description: "Mobile application for community activity management.",
    image: flutterImg,
    color: "#a5f3fc",
  },
  {
    id: 3,
    title: "Search Infrastructure",
    subtitle: "OpenSearch • Docker",
    description: "Internal project optimizing large-scale data retrieval.",
    isClassified: true,
    color: "#e9d5ff",
  },
];

const ProjectsSection = ({ id }) => {
  const doodleField = useMemo(() => {
    const icons = [Music, Star, Sparkles, Moon, Heart];
    const colors = ["#fbcfe8", "#a5f3fc", "#e9d5ff"];
    
    return [...Array(12)].map((_, i) => {
      const zones = [
        { t: [5, 15], l: [5, 15] }, { t: [5, 15], l: [85, 95] },
        { t: [40, 60], l: [2, 8] }, { t: [40, 60], l: [92, 98] },
        { t: [80, 90], l: [10, 20] }, { t: [80, 90], l: [80, 90] },
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
        duration: 10 + Math.random() * 5
      };
    });
  }, []);

  const stars = useMemo(() => {
  return [...Array(100)].map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: (i % 3 === 0 ? 1 : i % 2 === 0 ? 2 : 3) + "px", 
    duration: Math.random() * 3 + 2 + "s",
    delay: Math.random() * 5 + "s",
    blur: i % 5 === 0 ? "1px" : "0px"
  }));
}, []);

  const shootingStars = useMemo(() => {
    return [...Array(4)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 40}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
    }));
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
        {shootingStars.map((s) => (
          <div key={s.id} className="shooting-star" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
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
            ease: "easeInOut"
          }}
          style={{
            position: "absolute",
            top: d.top,
            left: d.left,
            color: d.color,
            filter: `drop-shadow(0 0 8px ${d.color})`,
            zIndex: 1,
            pointerEvents: "none"
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
            <motion.div
              key={project.id}
              className="music-card"
              style={{
                "--accent-glow": `${project.color}33`,
                "--project-color": project.color,
                "--base-rotation": project.id % 2 === 0 ? "1deg" : "-1deg",
              }}
            >
              <div className="card-glass">
                <div className="album-art">
                  {project.isClassified ? (
                    <div className="classified-overlay">
                      <ShieldAlert size={32} />
                      <span>CLASSIFIED</span>
                    </div>
                  ) : (
                    <img src={project.image} alt={project.title} className="art-img" />
                  )}
                </div>

                <div className="track-info">
                  <h3 className="project-name">{project.title}</h3>
                  <p className="project-tech">{project.subtitle}</p>
                </div>

                <div className="playback-bar">
                  <div className="time-info">
                    <span>0:00</span>
                    <span>3:45</span>
                  </div>
                  <div className="progress-bg">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{
                        backgroundColor: project.color,
                        boxShadow: `0 0 12px ${project.color}66`,
                      }}
                    />
                  </div>
                </div>

                <p className="project-desc">{project.description}</p>

                <div className="player-controls">
                  <SkipBack size={20} className="control-icon" />
                  <div className="main-play-fake" style={{ backgroundColor: project.color }}>
                    <Play size={18} fill="white" color="white" />
                  </div>
                  <SkipForward size={20} className="control-icon" />
                  <Share2 size={18} className="control-icon" />
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
            transition={{ repeat: Infinity, duration: 1 + Math.random(), ease: "easeInOut" }}
          />
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;