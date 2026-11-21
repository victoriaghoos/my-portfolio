const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scrolls to an element and moves the keyboard focus along with it. Without the focus move, a
 * keyboard user who picks "Projects" sees the page scroll, but the next Tab starts again at the
 * button they just pressed. Smooth scrolling is skipped for visitors who prefer reduced motion.
 */
export const scrollToSection = (target: HTMLElement | null, { focus = true } = {}) => {
  if (!target) return;

  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });

  if (focus) {
    // tabindex="-1": focusable from script, but not added to the Tab order
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
};

/**
 * Same as scrollToSection, by id, but waits (up to 5 s) for the element to exist: the sections
 * are lazy-loaded and only built after the hub has been painted.
 */
export const scrollToSectionById = (id: string) => {
  const startedAt = performance.now();
  const tryScroll = () => {
    const target = document.getElementById(id);
    if (target) {
      scrollToSection(target);
    } else if (performance.now() - startedAt < 5000) {
      requestAnimationFrame(tryScroll);
    }
  };
  tryScroll();
};
