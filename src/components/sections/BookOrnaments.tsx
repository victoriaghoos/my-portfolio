// Small decorative SVG for the resume pages. The covers and page frames are baked images
// (src/assets/textures); everything here is aria-hidden, the text stays in the pages themselves.

// A four-pointed star centred on (x, y) with arms of length r
const Sparkle = ({ x, y, r }: { x: number; y: number; r: number }) => {
  const a = r * 0.25;
  const b = r - a;
  return (
    <path
      d={`M${x} ${y - r} l${a} ${b} l${b} ${a} l${-b} ${a} l${-a} ${b} l${-a} ${-b} l${-b} ${-a} l${b} ${-a}z`}
    />
  );
};

// The ink flourish under each chapter title
export const InkDivider = () => (
  <svg className="ink-divider" viewBox="0 0 200 18" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M10 9 H80 M120 9 H190" />
      <path d="M80 9 c6 -8 14 -8 20 0 c6 8 14 8 20 0" />
    </g>
    <g className="ink-divider-star">
      <Sparkle x={100} y={9} r={6} />
    </g>
  </svg>
);

export const WaxSeal = () => (
  <span className="wax-seal" aria-hidden="true">
    <svg viewBox="0 0 40 40" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="20" cy="20" r="14" />
      </g>
      <g fill="currentColor">
        <Sparkle x={20} y={20} r={8} />
      </g>
    </svg>
  </span>
);
