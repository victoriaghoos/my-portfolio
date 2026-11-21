import { Suspense, lazy, useEffect, useState } from 'react';

const AboutSection = lazy(() => import('./AboutSection'));
const ProjectsSection = lazy(() => import('./ProjectsSection'));
const SkillsSection = lazy(() => import('./SkillsSection'));
const ResumeSection = lazy(() => import('./ResumeSection'));
const NotesSection = lazy(() => import('./NotesSection'));
const SocialsSection = lazy(() => import('./SocialsSection'));

const WAKE_EVENTS = ['keydown', 'wheel', 'touchstart', 'pointerdown', 'scroll'] as const;

/**
 * The sections below the hub are built only after the hub has been painted: as soon as the
 * browser is idle, or right away when the visitor scrolls, types or arrives with a link to a
 * section (/home#about-section). Building all six at once took ~0.5 s of main thread on a slow
 * phone, right when the hub should appear.
 */
const useMountAfterFirstPaint = () => {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.location.hash);

  useEffect(() => {
    if (ready) return undefined;

    const mount = () => setReady(true);
    // Safari has no requestIdleCallback, so it falls back to a short timeout
    const hasIdle = 'requestIdleCallback' in window;
    const idleId = hasIdle ? window.requestIdleCallback(mount, { timeout: 1500 }) : undefined;
    const timeoutId = hasIdle ? undefined : window.setTimeout(mount, 300);
    WAKE_EVENTS.forEach((type) =>
      window.addEventListener(type, mount, { once: true, passive: true, capture: true }),
    );

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      WAKE_EVENTS.forEach((type) => window.removeEventListener(type, mount, { capture: true }));
    };
  }, [ready]);

  return ready;
};

const SectionsContainer = () => {
  const ready = useMountAfterFirstPaint();

  if (!ready) {
    return <div className="sections-container" />;
  }

  return (
    <div className="sections-container">
      <Suspense fallback={<div className="section-placeholder" />}>
        <AboutSection id="about-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <SkillsSection id="skills-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <ProjectsSection id="projects-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <ResumeSection id="resume-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <NotesSection id="notes-section" />
      </Suspense>
      <Suspense fallback={<div className="section-placeholder" />}>
        <SocialsSection id="socials-section" />
      </Suspense>
    </div>
  );
};

export default SectionsContainer;
