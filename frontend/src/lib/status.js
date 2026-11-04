import { isStale } from '../components/Reading.jsx';

// Pick the measure to summarise: prefer one with a typical range, then any level, then any reading.
export function pickPrimary(measures) {
  const withLatest = (measures || []).filter((m) => m.latest);
  return withLatest.find((m) => m.typicalRange) || withLatest.find((m) => m.parameter === 'level') || withLatest[0] || null;
}

// Status from the latest value vs EA's typical range. StatusChip pairs each key with text AND an icon shape.
export function getStatus(m) {
  if (!m || !m.latest) return { key: 'nodata', label: 'No data' };
  const r = m.typicalRange;
  if (!r) return { key: 'reading', label: 'Reading only' };
  const v = m.latest.value;
  if (v > r.high) return { key: 'high', label: 'High' };
  if (v < r.low) return { key: 'low', label: 'Low' };
  return { key: 'normal', label: 'Normal' };
}

export { isStale };

// Rising / falling / steady from oldest-first points: mean of last 3 vs first 3, small changes count as steady.
export function getTrend(points) {
  if (!points || points.length < 6) return null;
  const avg = (a) => a.reduce((s, p) => s + p.value, 0) / a.length;
  const first = avg(points.slice(0, 3));
  const last = avg(points.slice(-3));
  const limit = Math.max(0.02, Math.abs(avg(points)) * 0.03);
  if (last - first > limit) return { key: 'rising', label: 'Rising' };
  if (first - last > limit) return { key: 'falling', label: 'Falling' };
  return { key: 'steady', label: 'Steady' };
}

// Gauge fill (0-100) for the card accent. The typical range maps to 25-75%, so "normal" sits mid-tube.
// Decorative only: the chip and number carry the meaning.
export function levelPct(m) {
  const r = m?.typicalRange;
  if (!m?.latest || !r || r.high <= r.low) return null;
  const pct = 25 + ((m.latest.value - r.low) / (r.high - r.low)) * 50;
  return Math.max(4, Math.min(100, Math.round(pct)));
}
