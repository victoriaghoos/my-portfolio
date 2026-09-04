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

    const getSize = () => ({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });

    const resizeCanvas = () => {
      const { width, height } = getSize();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onResizeRef.current?.({ canvas, ctx, width, height, dpr });
    };

    const drawFrame = (timestamp: number, isStatic = false) => {
      const { width, height } = getSize();
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
        resizeCanvas();
        syncLoop();
      }, 100);
    };

    const handleMotionChange = () => syncLoop();

    window.addEventListener('resize', handleResize);
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    resizeCanvas();
    syncLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
      window.clearTimeout(resizeTimer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.disconnect();
      syncRef.current = null;
    };
  }, [canvasRef, rootRef, threshold]);
};

export default useCanvasAnimationLoop;
