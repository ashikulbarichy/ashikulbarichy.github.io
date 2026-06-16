import React from 'react';

interface GrainOverlayProps {
  /** Tailwind opacity class, e.g. "opacity-[0.06]". Defaults to opacity-[0.06]. */
  opacity?: string;
  className?: string;
}

/**
 * GrainOverlay
 *
 * Renders a subtle film-grain / noise texture over its parent container.
 * The parent must have `position: relative` (or `absolute`) for this to work.
 */
const GrainOverlay: React.FC<GrainOverlayProps> = ({
  opacity = 'opacity-[0.06]',
  className = '',
}) => (
  <div
    aria-hidden="true"
    className={`absolute inset-0 pointer-events-none select-none z-0 ${opacity} ${className}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

export default GrainOverlay;
