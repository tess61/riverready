import { useId } from 'react';

// Empty-state illustration: a glass map pin hovering over glowing ripples on night water.
// Decorative only; the message next to it carries the meaning. Colours come from tokens via CSS classes.
export default function EmptyScene() {
  const id = useId(); // unique gradient id, in case two scenes are ever on one page
  return (
    <svg className="empty-scene" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-pin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="es-stop-a" />
          <stop offset="1" className="es-stop-b" />
        </linearGradient>
      </defs>
      <path className="es-current es-c1" d="M-4 70C40 52 80 92 124 78S200 46 244 62" />
      <path className="es-current es-c2" d="M-4 96C46 82 86 116 132 102S206 76 244 90" />
      <ellipse className="es-ripple es-r3" cx="120" cy="122" rx="86" ry="20" />
      <ellipse className="es-ripple es-r2" cx="120" cy="122" rx="56" ry="13" />
      <ellipse className="es-ripple es-r1" cx="120" cy="122" rx="28" ry="6.5" />
      <g className="es-pin">
        <path fill={`url(#${id}-pin)`} d="M120 104s-22-20-22-38a22 22 0 0 1 44 0c0 18-22 38-22 38Z" />
        <path className="es-pin-shine" d="M106 58a15 15 0 0 1 12-10" />
        <circle className="es-pin-dot" cx="120" cy="66" r="7.5" />
      </g>
    </svg>
  );
}
