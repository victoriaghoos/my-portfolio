import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
  lazy,
  Suspense,
  type RefObject,
  type MutableRefObject,
  type CSSProperties,
} from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import '../styles/home.scss';

import MusicPlayer from './MusicPlayer';
import LanguageSelector from './LanguageSelector';

import avatarVideo from '../assets/images/avatar.webm';
import avatarImg from '../assets/images/avatar.webp';
import skillVideo from '../assets/images/think.webm';
import skillImg from '../assets/images/think.webp';
import codeVideo from '../assets/images/web-developer.webm';
import codeImg from '../assets/images/web-developer.webp';
import resumeVideo from '../assets/images/resume.webm';
import resumeImg from '../assets/images/resume.webp';
import socialsVideo from '../assets/images/social-media.webm';
import socialsImg from '../assets/images/social-media.webp';
import hologramImage from '../assets/images/hologram.webp';
import NightSkyBackground, { type NightSkyHandle } from './NightSkyBackground';
import type { PanelIcon } from './InteractivePanel';
import type { ConstellationScales, ScalingConfig } from './hubTypes';
import { isWebGLAvailable } from './webgl/webgl';
import SectionsContainer from './sections/SectionsContainer';
import { scrollToSection, scrollToSectionById } from '../utils/scrollToSection';

// three.js, the 3D icons and the constellations only load when the 3D hub is actually shown
// (desktop with a mouse). Phones and tablets never download them.
const HubScene = lazy(() => import('./HubScene'));

const DragHint = ({ isVisible }: { isVisible: boolean }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return <div className={`drag-hint ${!isVisible ? 'fade-out' : ''}`}>{t('drag_hint')}</div>;
};

const SceneContent = memo(function SceneContent({
  eventSource,
  nightSkyRef,
  show3DNav,
  initialRotationComplete,
  hasDragged,
  icons,
  scalingConfig,
  active,
  setActive,
  panelPositions,
  handleIconClick,
  onPanelPointerUp,
  isInView,
  constellationScales,
  onInitialRotationComplete,
  rotationYRef,
  targetRotationYRef,
  onWebglFailure,
}: {
  eventSource: RefObject<HTMLElement>;
  nightSkyRef: RefObject<NightSkyHandle>;
  show3DNav: boolean;
  initialRotationComplete: boolean;
  hasDragged: boolean;
  icons: PanelIcon[];
  scalingConfig: ScalingConfig;
  active: string | null;
  setActive: (id: string | null) => void;
  panelPositions: [number, number, number][];
  handleIconClick: (id: string) => void;
  onPanelPointerUp: () => void;
  isInView: boolean;
  constellationScales: ConstellationScales;
  onInitialRotationComplete: () => void;
  rotationYRef: MutableRefObject<number>;
  targetRotationYRef: MutableRefObject<number>;
  onWebglFailure: () => void;
}) {
  const { t } = useTranslation();
  const navEnabled = show3DNav && isInView;

  return (
    <div id="home-3d" className="home-3d-content">
      <NightSkyBackground ref={nightSkyRef} isVisible={isInView} lite={!show3DNav} />

      {navEnabled && initialRotationComplete && !hasDragged && <DragHint isVisible={!hasDragged} />}

      {show3DNav ? (
        // a static photo would jump to a different size when the 3D one appears, so the 3D
        // hub shows nothing while its chunk loads (it's quick on a desktop)
        <Suspense fallback={null}>
          <HubScene
            eventSource={eventSource}
            navEnabled={navEnabled}
            isInView={isInView}
            icons={icons}
            scalingConfig={scalingConfig}
            active={active}
            setActive={setActive}
            panelPositions={panelPositions}
            handleIconClick={handleIconClick}
            onPanelPointerUp={onPanelPointerUp}
            constellationScales={constellationScales}
            initialRotationComplete={initialRotationComplete}
            onInitialRotationComplete={onInitialRotationComplete}
            rotationYRef={rotationYRef}
            targetRotationYRef={targetRotationYRef}
            onWebglFailure={onWebglFailure}
          />
        </Suspense>
      ) : (
        // Phones, tablets and browsers without WebGL: the same photo as a plain image. It's the
        // largest thing on screen (the LCP element), so the browser fetches it first.
        <div className="hub-static-hologram">
          {/* React 18 doesn't know the camelCase fetchPriority prop yet (React 19 does), so it is
              passed as the lowercase HTML attribute; the spread keeps TypeScript happy */}
          <img
            src={hologramImage}
            alt=""
            {...{ fetchpriority: 'high' }}
            width={392}
            height={440}
          />
        </div>
      )}

      {!show3DNav && (
        <motion.nav
          className="static-menu-overlay mobile-home-layout"
          aria-label={t('a11y.sections_nav')}
          // Visible from the first frame (only a short slide): its icons are the LCP element on
          // phones, and a fade from opacity 0 made that paint wait for the animation.
          initial={{ y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="menu-grid">
            {icons.map((icon) => (
              <button
                key={icon.id}
                className="menu-item"
                onClick={() => handleIconClick(icon.id)}
                style={{ '--item-color': icon.color } as CSSProperties}
              >
                <div className="icon-wrapper">
                  {/* decorative: the label below already names the button */}
                  <img src={icon.png} alt="" decoding="async" />
                </div>
                <span className="label" style={{ userSelect: 'none' }}>
                  {icon.label}
                </span>
              </button>
            ))}
          </div>
        </motion.nav>
      )}

      {show3DNav && (
        // The 3D icons live in a WebGL canvas, which keyboards and screen readers can't reach.
        // This menu offers the same five destinations; it stays hidden until it gets focus.
        <nav className="hub-keyboard-nav" aria-label={t('a11y.sections_nav')}>
          {icons.map((icon) => (
            <button key={icon.id} type="button" onClick={() => handleIconClick(icon.id)}>
              {icon.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
});

// Lets other pages link straight to a section, e.g. /home#about-section. The sections are
// lazy-loaded, so wait (up to a few seconds) for the target to exist before scrolling to it.
const useScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    if (!id) return undefined;

    let frame = 0;
    const startedAt = performance.now();
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        scrollToSection(target);
      } else if (performance.now() - startedAt < 5000) {
        frame = requestAnimationFrame(tryScroll);
      }
    };
    frame = requestAnimationFrame(tryScroll);

    return () => cancelAnimationFrame(frame);
  }, [hash]);
};

const Home = () => {
  const { t } = useTranslation();
  useScrollToHash();

  const nightSkyRef = useRef<NightSkyHandle>(null);

  const icons: PanelIcon[] = useMemo(
    () => [
      {
        id: 'Socials',
        label: t('nav.socials'),
        png: socialsImg,
        video: socialsVideo,
        color: '#aadaf3',
      },
      {
        id: 'Resume',
        label: t('nav.resume'),
        png: resumeImg,
        video: resumeVideo,
        color: '#f3cbaa',
      },
      {
        id: 'Projects',
        label: t('nav.projects'),
        png: codeImg,
        video: codeVideo,
        color: '#aae7cb',
      },
      {
        id: 'About',
        label: t('nav.about'),
        png: avatarImg,
        video: avatarVideo,
        color: '#e7bcf3',
      },
      {
        id: 'Skills',
        label: t('nav.skills'),
        png: skillImg,
        video: skillVideo,
        color: '#dabcf3',
      },
    ],
    [t],
  );

  const [active, setActive] = useState<string | null>(null);
  const homeRef = useRef<HTMLElement>(null);
  const rotationYRef = useRef(0);
  const targetRotationYRef = useRef(0);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const [isDragCapable, setIsDragCapable] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
      const update = () => setIsDragCapable(mq.matches);
      mq.addEventListener('change', update);
      update();
      return () => mq.removeEventListener('change', update);
    }
  }, []);

  // Without WebGL (unsupported, crashed or lost context) the hub switches to the static menu.
  const [webglFailed, setWebglFailed] = useState(() => !isWebGLAvailable());
  const handleWebglFailure = useCallback(() => setWebglFailed(true), []);

  const isDesktop = dimensions.width >= 1024;
  const isTablet = !isDesktop && dimensions.width < 1024 && dimensions.width >= 600;
  const show3DNav = isDesktop && isDragCapable && !webglFailed;

  const scalingConfig: ScalingConfig = useMemo(() => {
    if (isDesktop) {
      return {
        radius: 10,
        iconScale: 0.7,
        iconPlaneSize: 1.6,
        ringInner: 0.9,
        ringOuter: 1.0,
        labelMargin: 70,
        hologramScale: 1,
        hologramRadius: 5,
        hologramHalo: [5.2, 5.4],
        hologramY: 0,
      };
    } else if (isTablet) {
      return {
        radius: 7.5,
        iconScale: 0.55,
        iconPlaneSize: 1.2,
        ringInner: 0.7,
        ringOuter: 0.8,
        labelMargin: 48,
        hologramScale: 0.9,
        hologramRadius: 4.5,
        hologramHalo: [4.7, 4.9],
        hologramY: 0.5,
      };
    } else {
      return {
        radius: 5.2,
        iconScale: 0.42,
        iconPlaneSize: 0.95,
        ringInner: 0.55,
        ringOuter: 0.65,
        labelMargin: 32,
        hologramScale: 1.2,
        hologramRadius: 4.0,
        hologramHalo: [4.2, 4.4],
        hologramY: 0.4,
      };
    }
  }, [isDesktop, isTablet]);

  const isInView = useInView(homeRef, { amount: 1 });

  useEffect(() => {
    if (!isInView) {
      setActive(null);
    }
  }, [isInView]);

  const numberOfIcons = icons.length;

  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startRot: 0,
    hasInteracted: false,
    hasDraggedThisGesture: false,
    clickedPanel: false,
  });

  const [initialRotationComplete, setInitialRotationComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [hasDragged, setHasDragged] = useState(false);

  const markInitialRotationComplete = useCallback(() => {
    setInitialRotationComplete((prev) => (prev ? prev : true));
  }, []);

  const handleIconClick = useCallback((iconId: string) => {
    const sectionMap: Record<string, string> = {
      About: 'about-section',
      Skills: 'skills-section',
      Projects: 'projects-section',
      Resume: 'resume-section',
      Socials: 'socials-section',
    };
    scrollToSectionById(sectionMap[iconId]);
  }, []);

  // pointerup fires before native mouseup, so this beats the shockwave check
  const markPanelPointerUp = useCallback(() => {
    dragRef.current.clickedPanel = true;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging || !initialRotationComplete || !show3DNav) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const rotationSpeed = 0.003;

      const centerY = window.innerHeight / 2;
      const isFront = dragRef.current.startY > centerY;

      const direction = isFront ? 1 : -1;

      targetRotationYRef.current = dragRef.current.startRot + deltaX * rotationSpeed * direction;

      if (!hasDragged && Math.abs(deltaX) > 5) {
        setHasDragged(true);
      }

      if (Math.abs(deltaX) > 5) {
        dragRef.current.hasDraggedThisGesture = true;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (dragRef.current.dragging) {
        dragRef.current.hasInteracted = true;
        if (!dragRef.current.hasDraggedThisGesture && !dragRef.current.clickedPanel) {
          if (nightSkyRef.current) {
            nightSkyRef.current.triggerShockwave(e.clientX, e.clientY);
          }
        }
      }
      dragRef.current.dragging = false;
      dragRef.current.clickedPanel = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [initialRotationComplete, hasDragged, show3DNav]);

  const panelPositions: [number, number, number][] = useMemo(
    () =>
      icons.map((_, i): [number, number, number] => {
        const angle = (i / numberOfIcons) * 2 * Math.PI;
        const x = scalingConfig.radius * Math.cos(angle);
        const z = scalingConfig.radius * Math.sin(angle);
        return [x, 0, z];
      }),
    [icons, numberOfIcons, scalingConfig.radius],
  );

  const constellationScales = useMemo(
    () => ({
      about: isDesktop ? 1.3 : 0.9,
      socials: isDesktop ? 0.8 : 0.6,
      resume: isDesktop ? 0.8 : 0.6,
      skills: isDesktop ? 0.8 : 0.6,
      projects: isDesktop ? 0.8 : 0.6,
    }),
    [isDesktop],
  );

  return (
    <>
      <div className="main-container">
        <a className="skip-link" href="#main">
          {t('a11y.skip_to_content')}
        </a>
        <header>
          <LanguageSelector />
          <MusicPlayer />
        </header>

        <main id="main" tabIndex={-1}>
          <h1 className="sr-only">{t('a11y.home_heading')}</h1>

          {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-to-rotate is a pointer-only enhancement; every icon stays reachable via its own button/click handler */}
          <section
            ref={homeRef}
            className="home-3d"
            onMouseDown={
              show3DNav && isInView
                ? (e) => {
                    if (!initialRotationComplete) return;
                    dragRef.current.dragging = true;
                    setIsDragging(true);
                    dragRef.current.hasDraggedThisGesture = false;
                    dragRef.current.clickedPanel = false;
                    dragRef.current.startX = e.clientX;
                    dragRef.current.startY = e.clientY;
                    dragRef.current.startRot = targetRotationYRef.current;
                  }
                : undefined
            }
            style={{
              cursor: show3DNav ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            <SceneContent
              eventSource={homeRef}
              nightSkyRef={nightSkyRef}
              show3DNav={show3DNav}
              initialRotationComplete={initialRotationComplete}
              hasDragged={hasDragged}
              icons={icons}
              scalingConfig={scalingConfig}
              active={active}
              setActive={setActive}
              panelPositions={panelPositions}
              handleIconClick={handleIconClick}
              onPanelPointerUp={markPanelPointerUp}
              isInView={isInView}
              constellationScales={constellationScales}
              onInitialRotationComplete={markInitialRotationComplete}
              rotationYRef={rotationYRef}
              targetRotationYRef={targetRotationYRef}
              onWebglFailure={handleWebglFailure}
            />
          </section>

          <SectionsContainer />
        </main>
      </div>
    </>
  );
};

export default Home;
