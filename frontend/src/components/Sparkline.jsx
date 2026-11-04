import { useId } from 'react';

// Inline SVG "river line" of oldest-first points (no chart library): a line with a soft gradient
// fill under it and a ringed dot on the latest value. Flat data is drawn as a mid-height line.
const W = 300, H = 72, PAD = 8;

export default function Sparkline({ points, label }) {
  const gid = `spark${useId().replace(/:/g, '')}`; // unique gradient id per chart (colons stripped for url())
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const x = (i) => PAD + (i / (points.length - 1)) * (W - 2 * PAD);
  const y = (v) => (max === min ? H / 2 : H - PAD - ((v - min) / (max - min)) * (H - 2 * PAD));
  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = points.length - 1;
  const area = `M${x(0).toFixed(1)},${H} L${line} L${x(last).toFixed(1)},${H} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line className="spark-base" x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} />
      <path d={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(last)} cy={y(vals[last])} r="7" fill="currentColor" opacity=".2" />
      <circle cx={x(last)} cy={y(vals[last])} r="4" fill="currentColor" />
    </svg>
  );
}
