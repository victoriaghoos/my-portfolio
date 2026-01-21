import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Play, SkipForward, SkipBack, Share2, ShieldAlert } from "lucide-react";
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
  const stars = useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1 + "px",
      duration: Math.random() * 3 + 2 + "s",
      delay: Math.random() * 5 + "s",
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
      </div>

      <div className="lofi-doodle note-1">♫</div>
      <div className="lofi-doodle star-1">✧</div>
      <div className="lofi-doodle note-2">♪</div>

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
              style={{ "--accent-glow": `${project.color}33` }} 
            >
              <div className="card-glass">
                <div className="album-art">
                  {project.isClassified ? (
                    <div className="classified-overlay">
                      <ShieldAlert size={32} />
                      <span>CLASSIFIED</span>
                    </div>
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="art-img"
                    />
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
                    <div
                      className="progress-fill"
                      style={{
                        backgroundColor: project.color,
                        width: "35%",
                        boxShadow: `0 0 12px ${project.color}66`,
                      }}
                    />
                  </div>
                </div>

                <p className="project-desc">{project.description}</p>

                <div className="player-controls">
                  <SkipBack size={20} className="control-icon" />
                  <div
                    className="main-play-fake"
                    style={{
                      backgroundColor: project.color,
                      boxShadow: `0 0 20px ${project.color}44`,
                    }}
                  >
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
        {[...Array(20)].map(
          (
            _,
            i, 
          ) => (
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
          ),
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;