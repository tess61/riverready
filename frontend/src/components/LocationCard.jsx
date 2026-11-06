import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { fmtDate } from './Reading.jsx';
import StatusChip from './StatusChip.jsx';
import StatusDial from './StatusDial.jsx';
import { ClockIcon, GaugeIcon, WarningIcon, WifiOffIcon } from './icons/index.jsx';
import { getStatus, isStale, pickPrimary } from '../lib/status.js';

// Home card. One request per card to /stations/{ref}; the backend caches EA for 5 min, and nothing polls.
// The small dial (decorative; aria-hidden) points to where the reading sits in its typical range.
export default function LocationCard({ location: l }) {
  const { data, loading, error } = useApi((s) => api.getStation(l.station_reference, s), [l.station_reference]);
  const m = data ? pickPrimary(data.station?.measures) : null;
  const status = loading ? { key: 'loading', label: 'Checking…' } : getStatus(error ? null : m);
  return (
    <Link to={`/locations/${l.id}`} className={`card loc-card is-${status.key}`}>
      <StatusDial measure={error ? null : m} statusKey={status.key} />
      <div className="loc-body">
        <h2>{l.name}</h2>
        <p className="loc-station"><GaugeIcon size={16} />{l.station_label || `Station ${l.station_reference}`}</p>
        <div className="loc-reading">
          {/* The value slot is always rendered (placeholder while loading) so nothing shifts when data arrives. */}
          <p className="loc-value">
            {m
              ? <><span className="num">{m.latest.value}</span> <span className="unit">{m.unit || ''}</span></>
              : <span className={loading ? 'value-pending' : 'num value-none'} aria-hidden="true">{loading ? '' : '–'}</span>}
          </p>
          <StatusChip status={status} />
        </div>
        {m && (
          <p className="meta">
            <ClockIcon size={16} />Updated {fmtDate(m.latest.dateTime)}
            {isStale(m.latest.dateTime) && <strong className="stale"><WarningIcon size={16} />may be out of date</strong>}
          </p>
        )}
        {error && <p className="meta"><WifiOffIcon size={16} />Live data unavailable</p>}
      </div>
    </Link>
  );
}
