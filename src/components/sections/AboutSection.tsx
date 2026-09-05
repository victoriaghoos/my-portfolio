import React, { useRef, useEffect, useState, useMemo, useCallback, type RefObject } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import useCanvasAnimationLoop, { type CanvasDrawArgs } from '../../hooks/useCanvasAnimationLoop';
import '../../styles/sections/AboutSection.scss';
import foto1 from '../../assets/images/foto1.webp';

const textVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const staggerVariants: Variants = {
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

interface OrbDrawArgs {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  timestamp?: number;
}

const useOrbCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  rootRef: RefObject<HTMLElement | null>,
) => {
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
    ({ ctx, width, height }: OrbDrawArgs) => {
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
    ({ ctx, width, height, timestamp }: CanvasDrawArgs) => {
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
    ({ ctx, width, height }: OrbDrawArgs) => drawOrbs({ ctx, width, height }),
    [drawOrbs],
  );

  useCanvasAnimationLoop(canvasRef, { rootRef, onResize, onDraw });
};

const useStarfieldCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  rootRef: RefObject<HTMLElement | null>,
) => {
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
    ({ ctx, width, height, timestamp, isStatic }: CanvasDrawArgs) => {
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

  const onDraw = drawStars;

  useCanvasAnimationLoop(canvasRef, { rootRef, onDraw });
};

const OrbBackground = React.memo(function OrbBackground({
  rootRef,
}: {
  rootRef: RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starFieldRef = useRef<HTMLCanvasElement>(null);

  useOrbCanvas(canvasRef, rootRef);
  useStarfieldCanvas(starFieldRef, rootRef);

  return (
    <div className="cosmic-background">
      <canvas ref={canvasRef} className="floating-orbs-canvas" />
      <canvas ref={starFieldRef} className="star-field" aria-hidden="true" />
    </div>
  );
});

const AboutSection = ({ id }: { id: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
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
                  <Trans i18nKey="about.greeting" components={[<span className="name-glow" />]} />
                </h3>

                <div className="bio-text">
                  <p>
                    <Trans
                      i18nKey="about.bio_p1"
                      components={[<span className="highlight" />, <span className="highlight" />]}
                    />
                  </p>

                  <p>
                    <Trans
                      i18nKey="about.bio_p2"
                      components={[<span className="highlight" />]}
                    />
                  </p>

                  <p>
                    <Trans
                      i18nKey="about.bio_p3"
                      components={[<span className="highlight" />]}
                    />
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
