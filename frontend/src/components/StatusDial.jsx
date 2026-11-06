import { levelPct } from '../lib/status.js';

// Half-circle meter: below typical | typical range | above typical, with a needle at the latest reading.
// Uses the same mapping as levelPct (typical range = 25-75%), so a normal reading points into the middle.
// Decorative (aria-hidden): the StatusChip beside it carries the meaning as text + icon.
const CX = 60, CY = 60, R = 46;
const SEGMENTS = [['low', 0, 0.25], ['normal', 0.25, 0.75], ['high', 0.75, 1]];

// t = 0 is the left end of the arc, t = 1 the right end.
function point(t) {
  return [CX - R * Math.cos(t * Math.PI), CY - R * Math.sin(t * Math.PI)];
}
function arc(a, b) {
  const [x1, y1] = point(a);
  const [x2, y2] = point(b);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export default function StatusDial({ measure, statusKey, size = 'md' }) {
  const pct = levelPct(measure);
  return (
    <svg className={`dial dial-${size}${pct === null ? ' is-empty' : ''}`} viewBox="0 0 120 68" aria-hidden="true" focusable="false">
      {SEGMENTS.map(([key, a, b]) => (
        <path key={key} className={`dial-seg seg-${key}${key === statusKey ? ' is-on' : ''}`} d={arc(a + 0.008, b - 0.008)} />
      ))}
      {pct !== null && (
        // Drawn pointing straight up, then turned: 0% = far left (-90deg), 100% = far right (+90deg).
        <g className="dial-needle" style={{ '--a': `${(pct / 100) * 180 - 90}deg` }}>
          <path d="M56.5 60 L60 20 L63.5 60Z" />
          <circle cx={CX} cy={CY} r="6.5" />
        </g>
      )}
    </svg>
  );
}
