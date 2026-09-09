import type { CSSProperties } from 'react';

/**
 * getCoverflowStyle
 *
 * Computes the CSS transform properties for a single card in the 3-D coverflow
 * carousel. Cards further from the active index are translated, rotated, scaled,
 * and faded to create the fan-out perspective effect.
 *
 * @param index       - The card's position in the list.
 * @param activeIndex - The currently active (centred) card index.
 * @param dragDelta   - Current drag offset in pixels (0 when not dragging).
 * @param isDragging  - Whether a drag gesture is in progress.
 */
export function getCoverflowStyle(
  index: number,
  activeIndex: number,
  dragDelta: number,
  isDragging: boolean,
): CSSProperties {
  const diff        = index - activeIndex;
  const virtualDiff = diff - dragDelta / 340;

  // Cards more than 3 positions away are hidden entirely
  if (Math.abs(diff) > 3) return { display: 'none' };

  const absD       = Math.abs(virtualDiff);
  const sign       = virtualDiff === 0 ? 0 : virtualDiff / Math.abs(virtualDiff);
  const scale      = 1.25 - Math.min(0.55, absD * 0.4);
  const translateX = sign * Math.min(absD, 2.5) * 52;
  const rotateY    = sign * Math.min(absD * 25, 50);
  const translateZ = -Math.min(absD * 85, 190);
  const opacity    = 1 - Math.min(0.7, absD * 0.28);
  const zIndex     = 100 - Math.round(Math.abs(diff) * 10);
  const isActive   = diff === 0;

  const transition = isDragging
    ? 'opacity 0.05s linear'
    : 'transform 0.55s cubic-bezier(0.25,1,0.5,1), opacity 0.45s ease, box-shadow 0.4s ease';

  return {
    position:      'absolute',
    top:           0,
    bottom:        0,
    width:         '100%',
    transform:     `translateX(calc(-50% + ${translateX}%)) perspective(1400px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
    left:          '50%',
    opacity,
    zIndex,
    pointerEvents: isActive ? 'auto' : 'none',
    transition,
    willChange:    'transform, opacity',
    boxShadow:     isActive
      ? '0 28px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07)'
      : `${sign * 6}px 16px 48px rgba(0,0,0,0.65)`,
  };
}
