import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { getTrend } from '../lib/status.js';
import Sparkline from './Sparkline.jsx';
import { TrendDownIcon, TrendSteadyIcon, TrendUpIcon } from './icons/index.jsx';

// Match the decimal places of the latest reading so 1.11 and 1.107 don't sit side by side.
const decimals = (v) => (String(v).split('.')[1] || '').length;

const TREND_ICONS = { rising: TrendUpIcon, falling: TrendDownIcon, steady: TrendSteadyIcon };

// Loaded lazily (detail page only). Fetches ~24h of one measure's readings, shows sparkline + trend label.
export default function TrendPanel({ measure }) {
  const { data, loading, error, reload } = useApi((s) => api.getReadings(measure.id, 24, s), [measure.id]);
  if (loading) return <div className="trend"><p className="muted small" role="status">Loading 24-hour trend…</p><div className="skel skel-spark" aria-hidden="true"><span /></div></div>;
  if (error) {
    return (
      <p className="muted small" role="status">
        24-hour trend unavailable. <button type="button" className="linklike" onClick={reload}>Retry</button>
      </p>
    );
  }
  const points = data?.items || [];
  const trend = getTrend(points);
  if (!trend) return <p className="muted small">Not enough recent readings to show a trend.</p>;
  const vals = points.map((p) => p.value);
  const unit = measure.unit || '';
  const dp = Math.min(4, Math.max(...[measure.latest?.value, ...vals].map(decimals)));
  const fmt = (v) => v.toFixed(dp);
  const label = `${trend.label} over the last 24 hours, from ${Math.min(...vals)} to ${Math.max(...vals)} ${unit}`;
  const Glyph = TREND_ICONS[trend.key];
  return (
    <div className={`trend trend-${trend.key}`}>
      <p className="trend-label"><Glyph size={22} /><strong>{trend.label}</strong> <span className="muted small">over the last 24 hours</span></p>
      <Sparkline points={points} label={label} />
      <dl className="trend-range small">
        <div><dt>24h low</dt><dd>{fmt(Math.min(...vals))} {unit}</dd></div>
        <div><dt>24h high</dt><dd>{fmt(Math.max(...vals))} {unit}</dd></div>
      </dl>
    </div>
  );
}
