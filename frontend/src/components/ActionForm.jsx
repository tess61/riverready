import { useId, useState } from 'react';
import Field from './Field.jsx';
import { CATEGORIES, PRIORITIES } from '../constants/actionTemplates.js';

// Create/edit form. `onSubmit(data)` should throw an ApiError on failure; its `fields` are shown inline.
export default function ActionForm({ initial, onSubmit, onCancel }) {
  const uid = useId();
  const [v, setV] = useState({
    title: initial?.title || '', description: initial?.description || '',
    category: initial?.category || 'other', priority: initial?.priority || 'medium', due_date: initial?.due_date || '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const set = (name, value) => setV((s) => ({ ...s, [name]: value }));

  async function submit(e) {
    e.preventDefault();
    setPending(true); setErrors({}); setFormError('');
    try {
      await onSubmit({ ...v, due_date: v.due_date || null, description: v.description || null });
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message || 'Could not save this action.');
      setPending(false);
    }
  }

  const select = (name, label, options) => (
    <div className={`field${errors[name] ? ' has-error' : ''}`}>
      <label htmlFor={`${uid}-${name}`}>{label}</label>
      <select id={`${uid}-${name}`} value={v[name]} onChange={(e) => set(name, e.target.value)} aria-invalid={errors[name] ? 'true' : undefined}>
        {Object.entries(options).map(([k, text]) => <option key={k} value={k}>{text}</option>)}
      </select>
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <form className="form action-form" onSubmit={submit} noValidate>
      <h3>{initial ? 'Edit action' : 'Add an action'}</h3>
      {formError && <p className="field-error" role="alert">{formError}</p>}
      <Field label="Title" name="title" value={v.title} onChange={set} error={errors.title} maxLength={150} required />
      <Field label="Description (optional)" name="description" value={v.description} onChange={set} error={errors.description} multiline />
      <div className="form-row">
        {select('category', 'Category', CATEGORIES)}
        {select('priority', 'Priority', PRIORITIES)}
        <Field label="Due date (optional)" name="due_date" type="date" value={v.due_date} onChange={set} error={errors.due_date} />
      </div>
      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Saving…' : initial ? 'Save changes' : 'Add action'}</button>
        <button type="button" className="btn" onClick={onCancel} disabled={pending}>Cancel</button>
      </div>
    </form>
  );
}
