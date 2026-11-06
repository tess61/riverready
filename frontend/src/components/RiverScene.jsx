import { useId } from 'react';

// Original illustration: a house and a tree on the riverbank. The water line sits lower or higher with
// the reading's status (high = water reaches the house). Decorative only (aria-hidden); colours come
// from tokens so it follows light/dark mode. It rises once on load and then stays still (no loop).
const WATER_Y = { low: 106, normal: 97, high: 80 };

// A gentle wave along y = 0, wider than the picture, filled down to the bottom edge.
function wave(amp) {
  let d = 'M-20 0';
  for (let x = -20; x < 220; x += 20) d += `q5 ${-amp} 10 0t10 0`;
  return `${d}V60H-20Z`;
}

export default function RiverScene({ statusKey }) {
  const gid = useId();
  const y = WATER_Y[statusKey] ?? WATER_Y.normal;
  return (
    <svg className={`scene scene-${statusKey}`} viewBox="0 0 200 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="sc-stop-a" />
          <stop offset="1" className="sc-stop-b" />
        </linearGradient>
        <clipPath id={`${gid}c`}><rect width="200" height="120" rx="16" /></clipPath>
      </defs>
      {/* Rounded frame so the water and bank end softly instead of at a hard square edge. */}
      <g clipPath={`url(#${gid}c)`}>
        <path className="sc-bank" d="M0 92C40 87 70 86 100 86S170 88 200 91V120H0Z" />
        <rect className="sc-trunk" x="157" y="60" width="6" height="29" rx="2" />
        <circle className="sc-leaf" cx="160" cy="50" r="18" />
        <circle className="sc-leaf-2" cx="147" cy="60" r="10" />
        <rect className="sc-wall" x="60" y="55" width="64" height="33" rx="2" />
        <path className="sc-roof" d="M52 58L92 29L132 58Z" />
        <rect className="sc-door" x="85" y="67" width="14" height="21" rx="2" />
        <rect className="sc-window" x="68" y="63" width="11" height="10" rx="1.5" />
        <rect className="sc-window" x="106" y="63" width="11" height="10" rx="1.5" />
        <g className="sc-water" style={{ '--y': `${y}px` }}>
          <path className="sc-wave-back" d={wave(3)} transform="translate(-8 -4)" />
          <path className="sc-wave" d={wave(4)} fill={`url(#${gid})`} />
        </g>
      </g>
    </svg>
  );
}
