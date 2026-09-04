/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare module '*.hdr';
declare module '*.exr';

declare module '@pmndrs/assets/hdri/*' {
  const url: string;
  export default url;
}

declare module 'react-simple-typewriter' {
  export interface TypewriterProps {
    words: string[];
    loop?: number | boolean;
    typeSpeed?: number;
    deleteSpeed?: number;
    delaySpeed?: number;
    cursor?: boolean;
    cursorStyle?: string;
    cursorBlinking?: boolean;
    onType?: (count: number) => void;
    onDelete?: (count: number) => void;
    onLoopDone?: (count: number, isDone: boolean) => void;
  }
  export function Typewriter(props: TypewriterProps): JSX.Element;
}

declare module 'react-pageflip' {
  import { Component, ReactNode } from 'react';

  export interface PageFlipProps {
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
    startPage?: number;
    onFlip?: (e: { data: number }) => void;
    onFlipStart?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: unknown }) => void;
    onUpdate?: (e: { data: unknown }) => void;
  }

  interface PageFlipController {
    turnToPage: (page: number) => void;
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  }

  export default class HTMLFlipBook extends Component<PageFlipProps> {
    pageFlip(): PageFlipController;
  }
}
