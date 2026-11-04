import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import Field from '../components/Field.jsx';
import { ErrorNotice, Loading, Success } from '../components/Feedback.jsx';

const EMPTY = { name: '', station_reference: '', station_label: '', river_name: '', town: '', notes: '', risk_note: '' };

// Create (/locations/new?station=REF, prefilled from EA) and edit (/locations/:id/edit).
export default function LocationForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const ref = params.get('station');
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState('');

  // Source of initial values: the stored location (edit) or the chosen EA station (create).
  const source = useApi(id ? (s) => api.getLocation(id, s) : ref ? (s) => api.getStation(ref, s) : null, [id, ref]);
  useEffect(() => {
    const d = source.data;
    if (!d) return;
    if (id) setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(d).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ''])) });
    else if (d.station) {
      const st = d.station;
      setForm({ ...EMPTY, name: st.label || '', station_reference: st.reference, station_label: st.label || '', river_name: st.river || '', town: st.town || '' });
    }
  }, [source.data, id]);
  // If the EA lookup fails when creating, still allow saving with just the reference.
  useEffect(() => { if (!id && ref && source.error) setForm((f) => ({ ...f, station_reference: ref })); }, [id, ref, source.error]);

  const change = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  async function submit(e) {
    e.preventDefault();
    setPending(true); setErrors({}); setFormError(null); setSaved('');
    try {
      const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const loc = id ? await api.updateLocation(id, body) : await api.createLocation(body);
      setSaved(id ? 'Location updated.' : 'Location saved.');
      setTimeout(() => navigate(`/locations/${loc.id}`), 700);
    } catch (err) {
      setPending(false);
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      setFormError(err);
    }
  }

  if (!id && !ref) return <ErrorNotice title="No station chosen" error={{ message: 'Pick a station first, then save it as a location.' }} onRetry={() => navigate('/search')} />;
  if (source.loading) return <Loading label={id ? 'Loading location…' : 'Loading station details…'} />;
  if (id && source.error) return <ErrorNotice error={source.error} onRetry={source.reload} title="Could not load this location" />;

  return (
    <>
      <h1>{id ? 'Edit location' : 'Save as location'}</h1>
      {!id && source.error && <p className="fb fb-warn" role="status">Station details could not be loaded. You can still save with the reference {ref}.</p>}
      <form onSubmit={submit} noValidate className="form">
        <Field label="Location name" name="name" value={form.name} onChange={change} error={errors.name} required maxLength={100} hint="For example: Home, Mum's house" />
        <Field label="Station reference" name="station_reference" value={form.station_reference} onChange={change} error={errors.station_reference} required maxLength={50} readOnly={!id} />
        <Field label="Station name" name="station_label" value={form.station_label} onChange={change} error={errors.station_label} maxLength={150} />
        <Field label="River" name="river_name" value={form.river_name} onChange={change} error={errors.river_name} maxLength={100} />
        <Field label="Town" name="town" value={form.town} onChange={change} error={errors.town} maxLength={100} />
        <Field label="Notes" name="notes" value={form.notes} onChange={change} error={errors.notes} multiline maxLength={2000} />
        <Field label="Your own risk note" name="risk_note" value={form.risk_note} onChange={change} error={errors.risk_note} maxLength={255} hint="Your own reminder, not official advice." />
        {formError && !Object.keys(errors).length && <ErrorNotice error={formError} title="Could not save" />}
        {formError && Object.keys(errors).length > 0 && <p className="field-error" role="alert">Please fix the highlighted fields.</p>}
        <Success message={saved} />
        <div className="actions">
          <button className="btn btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save location'}</button>
          <Link className="btn" to={id ? `/locations/${id}` : '/search'}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
