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
