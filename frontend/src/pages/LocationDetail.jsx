import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { ErrorNotice, Loading } from '../components/Feedback.jsx';
import ActionList from '../components/ActionList.jsx';
import ReadingPanel from '../components/ReadingPanel.jsx';

// One call to /overview gives stored info + actions + live EA data.
export default function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi((s) => api.getOverview(id, s), [id]);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState(null);

  async function remove() {
    if (!window.confirm(`Delete “${data.location.name}” and all its actions? This cannot be undone.`)) return;
    setDeleting(true); setDelError(null);
    try { await api.deleteLocation(id); navigate('/', { replace: true }); }
    catch (e) { setDelError(e); setDeleting(false); }
  }

  if (loading && !data) return <Loading label="Loading location…" />;
  if (error) return <ErrorNotice error={error} onRetry={reload} title={error.status === 404 ? 'Location not found' : 'Could not load this location'} />;
  const { location: l, actions, external } = data;

  return (
    <>
      <p><Link to="/">← My locations</Link></p>
      <div className="page-head">
        <h1>{l.name}</h1>
        <div className="actions">
          <Link className="btn" to={`/locations/${l.id}/edit`}>Edit</Link>
          <button type="button" className="btn btn-danger" onClick={remove} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
      {delError && <ErrorNotice error={delError} title="Could not delete" />}

      <section className="panel" aria-labelledby="info-h">
        <h2 id="info-h">Saved details</h2>
        <dl className="details">
          <dt>Station</dt><dd>{l.station_label || '—'} ({l.station_reference})</dd>
          <dt>River</dt><dd>{l.river_name || '—'}</dd>
          <dt>Town</dt><dd>{l.town || '—'}</dd>
          <dt>Your risk note</dt><dd>{l.risk_note || '—'}</dd>
          <dt>Notes</dt><dd className="pre">{l.notes || '—'}</dd>
        </dl>
      </section>

      <ReadingPanel external={external} onRetry={reload} />

      <ActionList locationId={l.id} initial={actions} />
    </>
  );
}
