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
    // jsdom does no layout, so every element is 0x0 unless we give it a size
    setCanvasSize(300, 150);
  });

  const setCanvasSize = (width: number, height: number) => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height);
  };

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('sizes the canvas and reports it through onResize on mount', () => {
    const onResize = vi.fn();
    render(<TestHarness onResize={onResize} />);

    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize.mock.calls[0][0]).toMatchObject({
      width: 300,
      height: 150,
      dpr: expect.any(Number),
    });
  });

  it('skips resize and draw callbacks while the canvas has no size', () => {
    setCanvasSize(0, 0);
    const onResize = vi.fn();
    const onDraw = vi.fn();
    render(<TestHarness onDraw={onDraw} onResize={onResize} />);

    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(onResize).not.toHaveBeenCalled();
    expect(onDraw).not.toHaveBeenCalled();
  });

  it('sizes the canvas on the next draw once it gets a size after mount', () => {
    setCanvasSize(0, 0);
    const onResize = vi.fn();
    const onDraw = vi.fn();
    render(<TestHarness onDraw={onDraw} onResize={onResize} />);

    // not 300x150: that is a canvas's default size, so it would already match
    setCanvasSize(640, 360);
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(onResize).toHaveBeenCalledWith(expect.objectContaining({ width: 640, height: 360 }));
    expect(onDraw).toHaveBeenCalledWith(expect.objectContaining({ width: 640, height: 360 }));
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
