import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { fmtDate } from './Reading.jsx';
import StatusChip from './StatusChip.jsx';
import { getStatus, isStale, pickPrimary } from '../lib/status.js';

// Home card. One request per card to /stations/{ref}; the backend caches EA for 5 min, and nothing polls.
export default function LocationCard({ location: l }) {
  const { data, loading, error } = useApi((s) => api.getStation(l.station_reference, s), [l.station_reference]);
  const m = data ? pickPrimary(data.station?.measures) : null;
  const status = loading ? { key: 'loading', label: 'Checking…', icon: '…' } : getStatus(error ? null : m);
  return (
    <Link to={`/locations/${l.id}`} className="card">
      <h2>{l.name}</h2>
      <p>{l.station_label || `Station ${l.station_reference}`}</p>
      <p className="status-line">
        <StatusChip status={status} />
        {m && <strong className="card-value">{m.latest.value} {m.unit || ''}</strong>}
      </p>
      {m && (
        <p className="muted small">
          Updated {fmtDate(m.latest.dateTime)}
          {isStale(m.latest.dateTime) && <strong className="stale"> ⚠ may be out of date</strong>}
        </p>
      )}
      {error && <p className="muted small">Live data unavailable</p>}
    </Link>
  );
}
