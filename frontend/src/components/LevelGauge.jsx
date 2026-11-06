import { levelPct } from '../lib/status.js';

// Vertical river-level tube: the station's typical low and high as marked lines, and the latest
// reading as the water line. Every mark is labelled in text, so the picture is readable without colour.
// Only shown when EA publishes a typical range for the measure.
export default function LevelGauge({ measure: m }) {
  const r = m?.typicalRange;
  const pct = levelPct(m);
  if (!r || pct === null) return null;
  const unit = m.unit || '';
  return (
    <figure className="level">
      <figcaption className="hero-label">Level against the typical range</figcaption>
      <div className="level-body">
        <div className="level-col">
          <p className="level-now" style={{ bottom: `${pct}%` }}>
            <span className="small">Now</span>
            <span><span className="num">{m.latest.value}</span> <span className="unit">{unit}</span></span>
          </p>
        </div>
        <div className="level-tube" aria-hidden="true">
          <span className="level-water" style={{ height: `${pct}%` }} />
        </div>
        <div className="level-col">
          <p className="level-mark" style={{ bottom: '75%' }}>Typical high <strong>{r.high} {unit}</strong></p>
          <p className="level-mark" style={{ bottom: '25%' }}>Typical low <strong>{r.low} {unit}</strong></p>
        </div>
      </div>
    </figure>
  );
}
