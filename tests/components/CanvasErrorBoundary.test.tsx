import { render, screen } from '@testing-library/react';
import CanvasErrorBoundary from '../../src/components/webgl/CanvasErrorBoundary';
import { watchContextLoss } from '../../src/components/webgl/webgl';

const BrokenScene = (): never => {
  throw new Error('texture failed to load');
};

describe('CanvasErrorBoundary', () => {
  beforeEach(() => {
    // React and the boundary both log the caught error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the scene when nothing goes wrong', () => {
    render(
      <CanvasErrorBoundary fallback={<p>fallback</p>}>
        <p>scene</p>
      </CanvasErrorBoundary>,
    );
    expect(screen.getByText('scene')).toBeInTheDocument();
  });

  it('shows the fallback instead of crashing the app, and reports the error', () => {
    const onError = vi.fn();
    render(
      <div>
        <p>rest of the page</p>
        <CanvasErrorBoundary fallback={<p>static menu</p>} onError={onError}>
          <BrokenScene />
        </CanvasErrorBoundary>
      </div>,
    );

    expect(screen.getByText('rest of the page')).toBeInTheDocument();
    expect(screen.getByText('static menu')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'texture failed to load' }),
    );
  });
});

describe('watchContextLoss', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('gives up only when the context is not restored within the grace period', () => {
    const canvas = document.createElement('canvas');
    const onLost = vi.fn();
    watchContextLoss(canvas, onLost, 3000);

    canvas.dispatchEvent(new Event('webglcontextlost'));
    vi.advanceTimersByTime(2999);
    expect(onLost).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onLost).toHaveBeenCalledTimes(1);
  });

  it('keeps the scene when three.js restores the context in time', () => {
    const canvas = document.createElement('canvas');
    const onLost = vi.fn();
    watchContextLoss(canvas, onLost, 3000);

    canvas.dispatchEvent(new Event('webglcontextlost'));
    vi.advanceTimersByTime(1000);
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    vi.advanceTimersByTime(5000);
    expect(onLost).not.toHaveBeenCalled();
  });

  it('stops listening after cleanup', () => {
    const canvas = document.createElement('canvas');
    const onLost = vi.fn();
    const stop = watchContextLoss(canvas, onLost, 3000);

    stop();
    canvas.dispatchEvent(new Event('webglcontextlost'));
    vi.advanceTimersByTime(5000);
    expect(onLost).not.toHaveBeenCalled();
  });
});
