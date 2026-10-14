import { memo, useCallback, useMemo, useRef } from 'react';
import useCanvasAnimationLoop, { type CanvasDrawArgs } from '../hooks/useCanvasAnimationLoop';
import '../styles/notesStars.scss';

// Twinkling star field shared by the Notes section and the Notes pages.
const NotesStars = memo(function NotesStars({
  count = 320,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(
    () =>
      [...Array(count)].map(() => ({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.1 + 0.3,
        alpha: Math.random() * 0.45 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0018 + 0.0008,
        tint: Math.random() < 0.18,
      })),
    [count],
  );

  const draw = useCallback(
    ({ ctx, width, height, timestamp, isStatic }: CanvasDrawArgs) => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        const twinkle = isStatic ? 1 : 0.65 + Math.sin(timestamp * star.speed + star.phase) * 0.3;
        ctx.globalAlpha = Math.min(1, Math.max(0, star.alpha * twinkle));
        ctx.fillStyle = star.tint ? '#c4b5fd' : '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
    [stars],
  );

  useCanvasAnimationLoop(canvasRef, { rootRef, onDraw: draw });

  return (
    <div ref={rootRef} className={`notes-stars ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
});

export default NotesStars;
