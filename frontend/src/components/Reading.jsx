import { WarningIcon } from './icons/index.jsx';

// Formatting helpers + stale check shared by search preview and detail page.
export const STALE_HOURS = 6; // readings older than this get a warning

export function fmtDate(iso) {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(d) ? d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'unknown time';
}

export function isStale(iso) {
  const d = iso ? new Date(iso) : null;
  return !d || isNaN(d) || Date.now() - d.getTime() > STALE_HOURS * 3600 * 1000;
}

// One block per measure: name, value + unit, timestamp. Several measures are listed separately.
export function MeasureList({ measures }) {
  if (!measures || measures.length === 0) return <p className="muted">This station reports no measurements.</p>;
  return (
    <ul className="measures">
      {measures.map((m, i) => (
        <li key={m.id || i} className="measure">
          <h3>{m.name || 'Measurement'}</h3>
          {m.latest ? (
            <>
              <p className="value"><span className="num">{m.latest.value}</span> <span className="unit">{m.unit || ''}</span></p>
              <p className="meta">
                Updated {fmtDate(m.latest.dateTime)}
                {isStale(m.latest.dateTime) && <strong className="stale"><WarningIcon size={16} />Reading may be out of date</strong>}
              </p>
              {m.typicalRange && <p className="meta">Typical range {m.typicalRange.low}–{m.typicalRange.high} {m.unit || ''}</p>}
            </>
          ) : <p className="muted">No reading available right now.</p>}
        </li>
      ))}
    </ul>
  );
}
