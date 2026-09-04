import { useRef } from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import useCanvasAnimationLoop, {
  type CanvasDrawArgs,
  type CanvasResizeArgs,
} from '../../src/hooks/useCanvasAnimationLoop';

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const TestHarness = ({
  onDraw,
  onResize,
  threshold,
}: {
  onDraw?: (args: CanvasDrawArgs) => void;
  onResize?: (args: CanvasResizeArgs) => void;
  threshold?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimationLoop(canvasRef, { onDraw, onResize, threshold });
  return <canvas ref={canvasRef} data-testid="canvas" />;
};

describe('useCanvasAnimationLoop', () => {
  let observerCallback: ObserverCallback;
  let rafSpy: MockInstance<typeof window.requestAnimationFrame>;
  let cafSpy: MockInstance<typeof window.cancelAnimationFrame>;

  beforeEach(() => {
    window.IntersectionObserver = vi.fn().mockImplementation(function (callback: ObserverCallback) {
      observerCallback = callback;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }) as unknown as typeof IntersectionObserver;
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('sizes the canvas and reports it through onResize on mount', () => {
    const onResize = vi.fn();
    render(<TestHarness onResize={onResize} />);

    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize.mock.calls[0][0]).toMatchObject({
      width: 0,
      height: 0,
      dpr: expect.any(Number),
    });
  });

  it('schedules an animation frame when visible and motion is not reduced', () => {
    render(<TestHarness onDraw={vi.fn()} />);
    expect(rafSpy).toHaveBeenCalled();
  });

  it('draws a single static frame instead of animating when scrolled out of view', () => {
    const onDraw = vi.fn();
    render(<TestHarness onDraw={onDraw} />);
    onDraw.mockClear();
    rafSpy.mockClear();

    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(cafSpy).toHaveBeenCalled();
    expect(onDraw).toHaveBeenCalledWith(expect.objectContaining({ isStatic: true }));
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('resumes animating once back in view', () => {
    const onDraw = vi.fn();
    render(<TestHarness onDraw={onDraw} />);

    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });
    rafSpy.mockClear();

    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(rafSpy).toHaveBeenCalled();
  });

  it('disconnects the observer and cancels pending frames on unmount', () => {
    const disconnect = vi.fn();
    window.IntersectionObserver = vi.fn().mockImplementation(function (callback: ObserverCallback) {
      observerCallback = callback;
      return { observe: vi.fn(), disconnect };
    }) as unknown as typeof IntersectionObserver;

    const { unmount } = render(<TestHarness onDraw={vi.fn()} />);
    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
