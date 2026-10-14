import { Component, type ErrorInfo, type ReactNode } from 'react';

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  /** Rendered instead of the 3D scene once it has failed. */
  fallback?: ReactNode;
  /** Lets the parent switch to its non-WebGL layout. */
  onError?: (error: Error) => void;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

// React Three Fiber re-throws errors from inside <Canvas> (a texture that fails to load, a shader
// that doesn't compile) into the DOM tree. Without a boundary that unmounts the whole app.
class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      '3D scene failed, falling back to the static layout.',
      error,
      info.componentStack,
    );
    this.props.onError?.(error);
  }

  render() {
    return this.state.hasError ? (this.props.fallback ?? null) : this.props.children;
  }
}

export default CanvasErrorBoundary;
