import { useId } from 'react';

// Labelled input/textarea with inline error linked via aria-describedby.
export default function Field({ label, name, value, onChange, error, multiline, hint, ...rest }) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="muted small">{hint}</p>}
      <Tag id={id} name={name} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} rows={multiline ? 4 : undefined} {...rest} />
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}
