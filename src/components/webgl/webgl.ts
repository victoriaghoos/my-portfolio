import { useCallback, useEffect, useRef } from 'react';
import type { RootState } from '@react-three/fiber';

let webglSupport: boolean | undefined;

// Checked once per page load: some browsers, GPUs and privacy settings have no WebGL at all.
export const isWebGLAvailable = (): boolean => {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
};

// Three.js tries to restore a lost WebGL context by itself (GPU reset, driver update, too many
// contexts open), so only give up when it hasn't come back within the grace period.
export const watchContextLoss = (
  canvas: HTMLCanvasElement,
  onLost: () => void,
  gracePeriodMs = 3000,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const handleLost = () => {
    clearTimeout(timer);
    timer = setTimeout(onLost, gracePeriodMs);
  };
  const handleRestored = () => clearTimeout(timer);

  canvas.addEventListener('webglcontextlost', handleLost);
  canvas.addEventListener('webglcontextrestored', handleRestored);

  return () => {
    clearTimeout(timer);
    canvas.removeEventListener('webglcontextlost', handleLost);
    canvas.removeEventListener('webglcontextrestored', handleRestored);
  };
};

// Returns an `onCreated` handler for <Canvas> that watches its context and cleans up on unmount.
export const useContextLossHandler = (onLost: () => void) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  return useCallback(
    ({ gl }: Pick<RootState, 'gl'>) => {
      cleanupRef.current?.();
      cleanupRef.current = watchContextLoss(gl.domElement, onLost);
    },
    [onLost],
  );
};
