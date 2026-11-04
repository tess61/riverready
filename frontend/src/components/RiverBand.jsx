// Signature artwork: a river seen from above, winding through layers of earth (moss, ochre, clay).
// Purely decorative. The dashed highlight drifts along the channel (paused when reduced motion is on).
const RIVER = 'M-40 96C90 96 150 52 290 56S470 112 620 102 800 42 950 50 1110 104 1240 86';

export default function RiverBand({ tall = false }) {
  return (
    <svg className={`river-band${tall ? ' is-tall' : ''}`} viewBox="0 0 1200 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <path className="rb-moss" d="M0 44C150 22 300 64 450 48S750 18 900 38 1100 64 1200 42V140H0Z" />
      <path className="rb-ochre" d="M0 78C200 58 350 98 550 82S850 58 1000 80 1150 98 1200 82V140H0Z" />
      <path className="rb-clay" d="M0 114C180 98 380 128 600 114S900 98 1200 118V140H0Z" />
      <g className="rb-contours">
        <path d="M0 60C160 40 300 78 460 64S760 34 910 54 1100 78 1200 58" />
        <path d="M0 96C190 78 360 114 560 100S860 76 1010 98 1160 112 1200 100" />
      </g>
      <path className="rb-bank" d={RIVER} />
      <path className="rb-river" d={RIVER} />
      <path className="rb-flow" d={RIVER} />
    </svg>
  );
}
