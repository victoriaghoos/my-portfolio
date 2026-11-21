import { useEffect, useRef, type RefObject } from 'react';

export interface CanvasDrawArgs {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  timestamp: number;
  isStatic: boolean;
}

export interface CanvasResizeArgs {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}

interface UseCanvasAnimationLoopOptions {
  onDraw?: (args: CanvasDrawArgs) => void;
  onResize?: (args: CanvasResizeArgs) => void;
  rootRef?: RefObject<HTMLElement | null>;
  threshold?: number;
}

const useCanvasAnimationLoop = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { onDraw, onResize, rootRef, threshold = 0.1 }: UseCanvasAnimationLoopOptions = {},
) => {
  const isVisibleRef = useRef(true);
  const syncRef = useRef<(() => void) | null>(null);
  const onDrawRef = useRef(onDraw);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onDrawRef.current = onDraw;
    onResizeRef.current = onResize;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef?.current || canvas;
    if (!canvas || !root || typeof window === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (!ctx || typeof requestAnimationFrame === 'undefined') return;

    let animationFrameId: number | undefined;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const readSize = () => ({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
    // Cached instead of read every frame: reading clientWidth after the page changed (an
    // animation, a section mounting) forces the browser to lay out the page right then.
    // The ResizeObserver below fills it in and keeps it current: its callbacks run right after
    // the browser's own layout, so reading the size there is free. Only without
    // ResizeObserver (old browsers) is it read straight away.
    const hasResizeObserver = typeof ResizeObserver !== 'undefined';
    let size = hasResizeObserver ? { width: 0, height: 0 } : readSize();
    const getSize = () => size;

    // A canvas that is hidden or not laid out yet reports 0x0. Drawing then is pointless, and
    // callbacks that divide by the size (AboutSection's orbs) end up with Infinity/NaN
    // positions, so both resize and draw skip it.
    const hasSize = (width: number, height: number) => width > 0 && height > 0;

    const resizeCanvas = () => {
      const { width, height } = getSize();
      if (!hasSize(width, height)) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onResizeRef.current?.({ canvas, ctx, width, height, dpr });
    };

    const drawFrame = (timestamp: number, isStatic = false) => {
      const { width, height } = getSize();
      if (!hasSize(width, height)) return;
      // The canvas can get its size after mount without a window resize (a section that was
      // hidden becomes visible), so size it here when it no longer matches
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        resizeCanvas();
      }
      onDrawRef.current?.({ canvas, ctx, width, height, timestamp, isStatic });
    };

    const animate = (timestamp: number) => {
      drawFrame(timestamp, false);
      animationFrameId = requestAnimationFrame(animate);
    };

    const syncLoop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      }

      if (reducedMotionQuery.matches || !isVisibleRef.current) {
        drawFrame(0, true);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    syncRef.current = syncLoop;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (syncRef.current) {
          syncRef.current();
        }
      },
      { threshold },
    );

    observer.observe(root);

    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        size = readSize();
        resizeCanvas();
        syncLoop();
      }, 100);
    };

    // Its first callback comes right after the canvas is laid out and gives the initial size;
    // later ones catch size changes without a window resize (a section that becomes visible
    // or changes layout). syncLoop then redraws a canvas that stands still, or restarts the
    // animation.
    const resizeObserver = hasResizeObserver
      ? new ResizeObserver(() => {
          const next = readSize();
          if (next.width === size.width && next.height === size.height) return;
          size = next;
          resizeCanvas();
          syncLoop();
        })
      : null;

    const handleMotionChange = () => syncLoop();

    window.addEventListener('resize', handleResize);
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    if (resizeObserver) {
      resizeObserver.observe(canvas);
    } else {
      resizeCanvas();
      syncLoop();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
      window.clearTimeout(resizeTimer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.disconnect();
      resizeObserver?.disconnect();
      syncRef.current = null;
    };
  }, [canvasRef, rootRef, threshold]);
};

export default useCanvasAnimationLoop;
