import { memo, useMemo, useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Mail, ArrowUpCircle, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useCanvasAnimationLoop, { type CanvasDrawArgs } from '../../hooks/useCanvasAnimationLoop';
import { isWebGLAvailable } from '../webgl/webgl';
import '../../styles/sections/SocialsSection.scss';
import { scrollToSection } from '../../utils/scrollToSection';

const SocialsSky = lazy(() => import('./SocialsSky'));

const SocialsStarsCanvas = memo(function SocialsStarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const stars = useMemo(
    () =>
      [...Array(500)].map(() => ({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 0.35 + 0.28,
        alpha: Math.random() * 0.4 + 0.22,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0015 + 0.0008,
      })),
    [],
  );

  const drawStars = useCallback(
    ({ ctx, width, height, timestamp, isStatic }: CanvasDrawArgs) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      stars.forEach((star) => {
        const flicker =
          isStatic || reduceMotion
            ? 1
            : 0.72 + Math.sin(timestamp * star.speed + star.phase) * 0.16;
        ctx.globalAlpha = Math.min(1, Math.max(0, star.alpha * flicker));
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
    [reduceMotion, stars],
  );

  useCanvasAnimationLoop(canvasRef, {
    rootRef,
    onDraw: drawStars,
  });

  return (
    <div ref={rootRef} className="socials-stars-wrapper">
      <canvas ref={canvasRef} className="socials-stars-canvas" aria-hidden="true" />
    </div>
  );
});

const SocialCard = ({
  icon: Icon,
  title,
  handle,
  link,
  delay,
  strokeWidth = 1.5,
}: {
  icon: LucideIcon;
  title: string;
  handle: string;
  link: string;
  delay: number;
  strokeWidth?: number;
}) => {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="social-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay: delay, ease: 'easeOut' }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <div className="card-glow"></div>
      <div className="icon-wrapper">
        <Icon size={32} strokeWidth={strokeWidth} />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <span className="handle">{handle}</span>
      </div>
      <div className="card-shine"></div>
    </motion.a>
  );
};

const SocialsSection = ({ id }: { id: string }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  // The clouds are decoration: without WebGL the section keeps its gradient and stars.
  const [webglFailed, setWebglFailed] = useState(() => !isWebGLAvailable());
  const handleWebglFailure = useCallback(() => setWebglFailed(true), []);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFlyToCosmos = () => {
    // back to the top, with the focus on <main> so the next Tab starts at the top too
    scrollToSection(document.getElementById('main'));
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // mount the scene a viewport-height early so its first paint doesn't jank the scroll-snap into this section
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { t } = useTranslation();
  return (
    <section id={id} className="socials-section">
      <div className="transition-gradient-top"></div>
      <div className="canvas-container" ref={containerRef}>
        <SocialsStarsCanvas />
        {hasBeenVisible && !webglFailed && (
          <Suspense fallback={null}>
            <SocialsSky isVisible={isVisible} onWebglFailure={handleWebglFailure} />
          </Suspense>
        )}
      </div>

      <div className="content-overlay">
        <motion.div
          className="header-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">{t('contact')}</h2>
          <p className="section-subtitle">{t('socials.subtitle')}</p>
        </motion.div>

        <div className="cards-grid">
          <SocialCard
            icon={Linkedin}
            title="LinkedIn"
            handle={t('socials.linkedin_handle')}
            link="https://www.linkedin.com/in/victoriaghoos/"
            delay={0.2}
            strokeWidth={1.5}
          />
          <SocialCard
            icon={Github}
            title="GitHub"
            handle={t('socials.github_handle')}
            link="https://github.com/victoriaghoos"
            delay={0.4}
            strokeWidth={1.7}
          />
          <SocialCard
            icon={Mail}
            title="Email"
            handle={t('socials.email_handle')}
            link="mailto:ghoosvictoria@gmail.com"
            delay={0.6}
            strokeWidth={1.2}
          />
        </div>

        <motion.div
          className="footer-action"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={handleFlyToCosmos}
            onTap={handleFlyToCosmos}
            className="return-orb"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpCircle size={24} strokeWidth={1.5} />
            <span>{t('socials.return_cosmos')}</span>
          </motion.button>
          <p className="copyright">© 2026 Victoria Ghoos</p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialsSection;
