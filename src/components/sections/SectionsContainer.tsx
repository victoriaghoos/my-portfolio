import { Suspense, lazy, useEffect, useState } from 'react';

const loadAbout = () => import('./AboutSection');
const loadSkills = () => import('./SkillsSection');
const loadProjects = () => import('./ProjectsSection');
const loadResume = () => import('./ResumeSection');
const loadNotes = () => import('./NotesSection');
const loadSocials = () => import('./SocialsSection');

// In page order: they are built from the top down
const SECTIONS = [
  { id: 'about-section', load: loadAbout, Component: lazy(loadAbout) },
  { id: 'skills-section', load: loadSkills, Component: lazy(loadSkills) },
  { id: 'projects-section', load: loadProjects, Component: lazy(loadProjects) },
  { id: 'resume-section', load: loadResume, Component: lazy(loadResume) },
  { id: 'notes-section', load: loadNotes, Component: lazy(loadNotes) },
  { id: 'socials-section', load: loadSocials, Component: lazy(loadSocials) },
];

const WAKE_EVENTS = ['keydown', 'wheel', 'touchstart', 'pointerdown', 'scroll'] as const;

/**
 * The sections below the hub are built only after the hub has been painted, and then one per
 * idle moment, top to bottom. Building all six in one go took ~0.5 s of main thread on a slow
 * phone, right when the hub should appear. As soon as the visitor scrolls, taps or types, or
 * arrives with a link to a section (/home#about-section), the rest is built at once.
 * Returns how many sections (from the top) to render.
 */
const useProgressiveMount = () => {
  const total = SECTIONS.length;
  const [count, setCount] = useState(() =>
    typeof window !== 'undefined' && window.location.hash ? total : 0,
  );

  useEffect(() => {
    if (count >= total) return undefined;

    // the first step also starts downloading every section's code; downloads don't block
    if (count === 0) SECTIONS.forEach((section) => void section.load());

    const mountNext = () => setCount((c) => Math.min(total, c + 1));
    const mountAll = () => setCount(total);
    // Safari has no requestIdleCallback, so it falls back to a short timeout
    const hasIdle = 'requestIdleCallback' in window;
    const idleId = hasIdle
      ? window.requestIdleCallback(mountNext, { timeout: count === 0 ? 1500 : 500 })
      : undefined;
    const timeoutId = hasIdle ? undefined : window.setTimeout(mountNext, count === 0 ? 300 : 50);
    WAKE_EVENTS.forEach((type) =>
      window.addEventListener(type, mountAll, { once: true, passive: true, capture: true }),
    );

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      WAKE_EVENTS.forEach((type) => window.removeEventListener(type, mountAll, { capture: true }));
    };
  }, [count, total]);

  return count;
};

const SectionsContainer = () => {
  const count = useProgressiveMount();

  return (
    <div className="sections-container">
      {SECTIONS.slice(0, count).map(({ id, Component }) => (
        <Suspense key={id} fallback={<div className="section-placeholder" />}>
          <Component id={id} />
        </Suspense>
      ))}
    </div>
  );
};

export default SectionsContainer;
