import React, { useMemo, memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from 'react-i18next';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const ProjectsSection = ({ id }) => {
  const { t } = useTranslation();
  const projects = useMemo(() => [
    {
      id: 1,
      title: "BaseballLive", 
      subtitle: "Blazor • SignalR • C#",
      description: t('project_items.p1.desc'),
      image: baseballImg,
      color: "#ffbd7a",
      year: "2024",
      context: t('project_items.p1.context'), 
    },
    {
      id: 2,
      title: "Vrije Teid!", 
      subtitle: "Flutter • Dart • Firebase",
      description: t('project_items.p2.desc'), 
      image: flutterImg,
      color: "#a5f3fc",
      year: "2024",
      context: t('project_items.p2.context'), 
    },
    {
      id: 3,
      title: t('project_items.p3.title'), 
      subtitle: "OpenSearch • Docker • Vue • .NET",
      description: t('project_items.p3.desc'),
      isClassified: true,
      color: "#e9d5ff",
      year: "2025",
      context: t('project_items.p3.context'), 
    },
  ], [t]);
  const doodleRef = useRef();
  if (!doodleRef.current) {
    const icons = [Music, Star, Moon, Zap, Orbit, Component];
    const colors = ["#a5f3fc", "#e9d5ff", "#ffbd7a"];

    doodleRef.current = [...Array(12)].map((_, i) => {
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
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 5,
      };
    });
  }
  const doodleField = doodleRef.current;

  const starsCanvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const starConfig = useMemo(
    () =>
      [...Array(200)].map(() => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.002 + 0.0015,
      })),
    []
  );

  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frameId;
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawStars = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255,255,255,0.15)";
      ctx.shadowBlur = 0;
      starConfig.forEach((star) => {
        const glow = reduceMotion
          ? 1
          : 0.6 + Math.sin(time * star.speed + star.phase) * 0.25;
        ctx.globalAlpha = Math.min(1, Math.max(0, star.alpha * glow));
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const render = (timestamp) => {
      drawStars(timestamp);
      if (!reduceMotion) {
        frameId = requestAnimationFrame(render);
      }
    };

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 100);
    };

    resizeCanvas();
    render(0);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [reduceMotion, starConfig]);

  const visualizerRef = useRef();
  if (!visualizerRef.current) {
    visualizerRef.current = [...Array(20)].map((_, i) => ({
      id: i,
      duration: 1 + Math.random(),
      delay: i * 0.05,
    }));
  }
  const visualizerBars = visualizerRef.current;

  return (
    <section id={id} className="projects-section">
      <div className="stars-container">
        <canvas ref={starsCanvasRef} className="stars-canvas" aria-hidden="true" />
      </div>

      {doodleField.map((d) => (
        <motion.div
          key={d.id}
          className="sparkle-doodle"
          initial={reduceMotion ? { opacity: 0.18, scale: 1 } : { opacity: 0.18, scale: 0.7 }}
          animate={
            reduceMotion
              ? { opacity: 0.18, scale: 1 }
              : {
                  opacity: [0.18, 0.6, 0.18],
                  scale: [0.9, 1.1, 0.9],
                }
          }
          transition={{
            duration: d.duration,
            repeat: reduceMotion ? 0 : Infinity,
            delay: d.delay,
            ease: "easeInOut",
          }}
          style={{
            top: d.top,
            left: d.left,
            color: d.color,
            filter: `drop-shadow(0 0 8px ${d.color})`,
          }}
        >
          <d.Icon size={d.size} strokeWidth={2.1} />
        </motion.div>
      ))}

      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="section-title">
          <span className="title-glow">{t('projects')}</span>
        </h2>
        <div className="title-underline"></div>
      </motion.div>

      <div className="section-content">
        <motion.div 
          className="projects-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} 
        >
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              className="music-card"
              variants={cardVariants}
              whileHover={reduceMotion ? undefined : { 
                y: -12, 
                transition: { duration: 0.3 } 
              }}
            >
              <div className="card-hardware">
                <div className="album-art">
                  {project.isClassified ? (
                    <div className="classified-overlay">
                      <span>{t('classified')}</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="art-img"
                        loading="lazy"
                      />
                      <div className="screen-glare"></div>
                    </>
                  )}
                </div>
                <div className="card-info">
                  <h3 className="project-name">{project.title}</h3>

                  <div className="project-tech-stack">
                    {project.subtitle.split(" • ").map((tech, idx) => (
                      <span
                        key={`${project.id}-${idx}-${tech}`}
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
                      <div
                        className="progress-fill"
                        style={{
                          "--accent-color": project.color,
                        }}
                      />
                    </div>
                    <div className="time-info">
                      <span>{project.context}</span>
                      <span>{project.year}</span>
                    </div>
                  </div>

                  <div className="player-controls">
                    <button
                      type="button"
                      aria-label="Previous"
                      className="control-btn"
                    >
                      <SkipBack size={18} />
                    </button>
                    <motion.button 
                      className="main-play-btn"
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      style={{ "--accent-color": project.color }}
                    >
                      <Play size={18} fill="#1a1a2e" color="#1a1a2e" />
                    </motion.button>
                    <button
                      type="button"
                      aria-label="Next"
                      className="control-btn"
                    >
                      <SkipForward size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="audio-visualizer">
        {visualizerBars.map((bar) => (
          <div
            key={bar.id}
            className="bar"
            style={{
              "--duration": `${bar.duration}s`,
              animationDelay: `${bar.delay}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default memo(ProjectsSection);