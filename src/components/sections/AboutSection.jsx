import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import useCanvasAnimationLoop from '../../hooks/useCanvasAnimationLoop';
import '../../styles/sections/AboutSection.scss';
import foto1 from '../../assets/images/foto1.webp';

const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const ORB_COLORS = {
  cyan: 'rgba(138, 230, 255, 0.8)',
  mid: 'rgba(167, 139, 250, 0.6)',
  purple: 'rgba(192, 132, 252, 0.5)',
};

const useOrbCanvas = (canvasRef, rootRef) => {
  const orbs = useMemo(
    () => [
      {
        x: 0.1,
        y: 0.1,
        r: 150,
        color: ORB_COLORS.cyan,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
      },
      {
        x: 0.85,
        y: 0.6,
        r: 100,
        color: ORB_COLORS.mid,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
      },
      {
        x: 0.2,
        y: 0.8,
        r: 75,
        color: ORB_COLORS.purple,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
      },
    ],
    [],
  );

  const drawOrbs = useCallback(
    ({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        const x = orb.x * width;
        const y = orb.y * height;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [orbs],
  );

  const onDraw = useCallback(
    ({ ctx, width, height, timestamp }) => {
      orbs.forEach((orb) => {
        orb.x += orb.vx / width;
        orb.y += orb.vy / height;

        if (orb.x * width + orb.r > width || orb.x * width - orb.r < 0) orb.vx *= -1;
        if (orb.y * height + orb.r > height || orb.y * height - orb.r < 0) orb.vy *= -1;
      });

      drawOrbs({ ctx, width, height, timestamp });
    },
    [drawOrbs, orbs],
  );

  const onResize = useCallback(
    ({ ctx, width, height }) => drawOrbs({ ctx, width, height }),
    [drawOrbs],
  );

  useCanvasAnimationLoop(canvasRef, { rootRef, onResize, onDraw });
};

const useStarfieldCanvas = (canvasRef, rootRef) => {
  const stars = useMemo(
    () =>
      [...Array(300)].map(() => ({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.4 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.002 + 0.001,
      })),
    [],
  );

  const drawStars = useCallback(
    ({ ctx, width, height, timestamp, isStatic }) => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        const twinkle = isStatic ? 1 : 0.55 + Math.sin(timestamp * star.speed + star.phase) * 0.25;
        ctx.globalAlpha = Math.min(1, Math.max(0, star.alpha * twinkle));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [stars],
  );

  const onDraw = useCallback(
    ({ ctx, width, height, timestamp, isStatic }) =>
      drawStars({ ctx, width, height, timestamp, isStatic }),
    [drawStars],
  );

  useCanvasAnimationLoop(canvasRef, { rootRef, onDraw });
};

const OrbBackground = React.memo(function OrbBackground({ rootRef }) {
  const canvasRef = useRef(null);
  const starFieldRef = useRef(null);

  useOrbCanvas(canvasRef, rootRef);
  useStarfieldCanvas(starFieldRef, rootRef);

  return (
    <div className="cosmic-background">
      <canvas ref={canvasRef} className="floating-orbs-canvas" />
      <canvas ref={starFieldRef} className="star-field" aria-hidden="true" />
    </div>
  );
});

const AboutSection = ({ id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} ref={sectionRef} className="about-section">
      <OrbBackground rootRef={sectionRef} />

      <div className="about-content">
        <motion.div
          className="about-container"
          variants={staggerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
        >
          <motion.div className="section-header" variants={textVariants}>
            <h2 className="section-title">
              <span className="title-glow">{t('about.title')}</span>
            </h2>
            <div className="title-underline"></div>
          </motion.div>

          <div className="about-grid">
            <motion.div className="avatar-container" variants={textVariants}>
              <div className="hologram-avatar">
                <div className="avatar-glitch"></div>
                <div className="avatar-glow"></div>
                <img src={foto1} alt="Me" className="avatar-image" />
              </div>
              <div className="avatar-orbits">
                <div className="orbit-ring ring-1"></div>
                <div className="orbit-ring ring-2"></div>
                <div className="orbit-ring ring-3"></div>
              </div>
            </motion.div>

            <motion.div className="bio-container" variants={textVariants}>
              <div className="bio-content">
                <h3 className="bio-greeting">
                  <Trans i18nKey="about.greeting">
                    Hello, I'm <span className="name-glow">Victoria</span> 👋
                  </Trans>
                </h3>

                <div className="bio-text">
                  <p>
                    <Trans i18nKey="about.bio_p1">
                      I'm a <span className="highlight">Belgian software engineering student</span>{' '}
                      with a passion that grew from hobbyist Python coding into a professional
                      career path. What started as solving LeetCode problems for fun led me to
                      pursue an associate's degree at Howest, where I graduated{' '}
                      <span className="highlight">with high honors</span>.
                    </Trans>
                  </p>

                  <p>
                    <Trans i18nKey="about.bio_p2">
                      Currently further expanding my skills with a Bachelor of Applied Computer
                      Science specializing in software engineering, I'm balancing academic projects
                      with personal ventures like building this website. When I'm not coding, you'll
                      find me <span className="highlight">learning Japanese N4</span>, hiking the
                      Belgian countryside, or capturing moments through photography.
                    </Trans>
                  </p>

                  <p>
                    <Trans i18nKey="about.bio_p3">
                      I'm actively working toward my goal of a{' '}
                      <span className="highlight">Tokyo internship in 2027</span>, with plans to
                      relocate permanently to Chiba after graduation. I believe in blending
                      technical precision with creative expression, whether I'm debugging code or
                      composing the perfect picture.
                    </Trans>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
