import { isStale } from '../components/Reading.jsx';

// Pick the measure to summarise: prefer one with a typical range, then any level, then any reading.
export function pickPrimary(measures) {
  const withLatest = (measures || []).filter((m) => m.latest);
  return withLatest.find((m) => m.typicalRange) || withLatest.find((m) => m.parameter === 'level') || withLatest[0] || null;
}

// Status from the latest value vs EA's typical range. Each status has text AND an icon (never colour only).
export function getStatus(m) {
  if (!m || !m.latest) return { key: 'nodata', label: 'No data', icon: '○' };
  const r = m.typicalRange;
  if (!r) return { key: 'reading', label: 'Reading only', icon: '◆' };
  const v = m.latest.value;
  if (v > r.high) return { key: 'high', label: 'High', icon: '▲' };
  if (v < r.low) return { key: 'low', label: 'Low', icon: '▼' };
  return { key: 'normal', label: 'Normal', icon: '✓' };
}

export { isStale };

// Rising / falling / steady from oldest-first points: mean of last 3 vs first 3, small changes count as steady.
export function getTrend(points) {
  if (!points || points.length < 6) return null;
  const avg = (a) => a.reduce((s, p) => s + p.value, 0) / a.length;
  const first = avg(points.slice(0, 3));
  const last = avg(points.slice(-3));
  const limit = Math.max(0.02, Math.abs(avg(points)) * 0.03);
  if (last - first > limit) return { key: 'rising', label: 'Rising', icon: '↑' };
  if (first - last > limit) return { key: 'falling', label: 'Falling', icon: '↓' };
  return { key: 'steady', label: 'Steady', icon: '→' };
}
