import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { getTrend } from '../lib/status.js';
import Sparkline from './Sparkline.jsx';

// Loaded lazily (detail page only). Fetches ~24h of one measure's readings, shows sparkline + trend label.
export default function TrendPanel({ measure }) {
  const { data, loading, error, reload } = useApi((s) => api.getReadings(measure.id, 24, s), [measure.id]);
  if (loading) return <p className="muted small" role="status">Loading 24-hour trend…</p>;
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
  const label = `${trend.label} over the last 24 hours, from ${Math.min(...vals)} to ${Math.max(...vals)} ${measure.unit || ''}`;
  return (
    <div className="trend">
      <p className="trend-label"><span aria-hidden="true">{trend.icon}</span> <strong>{trend.label}</strong> <span className="muted small">over the last 24 hours</span></p>
      <Sparkline points={points} label={label} />
      <p className="muted small">Low {Math.min(...vals)} · High {Math.max(...vals)} {measure.unit || ''}</p>
    </div>
  );
}
