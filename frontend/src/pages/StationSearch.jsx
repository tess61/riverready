import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { Empty, ErrorNotice, Loading } from '../components/Feedback.jsx';
import { MeasureList } from '../components/Reading.jsx';

// Latest-reading preview for the selected station (one request, only after the user selects).
function Preview({ reference }) {
  const { data, loading, error, reload } = useApi((s) => api.getStation(reference, s), [reference]);
  return (
    <section className="panel" aria-live="polite" aria-label="Latest reading preview">
      <h2>Latest reading</h2>
      {loading && <Loading label="Loading latest reading…" />}
      {error && <ErrorNotice error={error} onRetry={reload} title="Could not load this station" />}
      {data && (
        <>
          <p><strong>{data.station?.label}</strong></p>
          <MeasureList measures={data.station?.measures} />
          <p className="muted small">Source: Environment Agency</p>
          <Link className="btn btn-primary" to={`/locations/new?station=${encodeURIComponent(reference)}`}>Save as location</Link>
        </>
      )}
    </section>
  );
}

export default function StationSearch() {
  const [text, setText] = useState('');
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState(null);

  // Debounce: only search 400ms after the user stops typing.
  useEffect(() => {
    const t = setTimeout(() => setTerm(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);

  const { data, loading, error, reload } = useApi(term.length >= 2 ? (s) => api.searchStations(term, s) : null, [term]);
  const items = data?.items || [];

  return (
    <>
      <h1>Find a station</h1>
      <div className="field">
        <label htmlFor="q">Station, river or town</label>
        <input id="q" type="search" value={text} onChange={(e) => { setText(e.target.value); setSelected(null); }}
          placeholder="e.g. Colwick" autoComplete="off" />
        <p className="muted small">Type at least 2 characters. Data comes from the Environment Agency.</p>
      </div>
      {loading && <Loading label="Searching…" />}
      {error && <ErrorNotice error={error} onRetry={reload} title="Search failed" />}
      {data && items.length === 0 && <Empty title={`No stations found for “${term}”.`}>Try a different spelling or a nearby town.</Empty>}
      {items.length > 0 && (
        <ul className="results">
          {items.map((s) => (
            <li key={s.reference}>
              <button type="button" className="result" aria-pressed={selected === s.reference} onClick={() => setSelected(s.reference)}>
                <strong>{s.label || s.reference}</strong>
                <span className="muted small">{[s.river, s.town].filter(Boolean).join(' · ') || 'No river or town listed'}</span>
              </button>
              {selected === s.reference && <Preview reference={s.reference} />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
