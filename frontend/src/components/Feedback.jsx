// Small shared states. Errors use role=alert; polite status uses aria-live.
export function Loading({ label = 'Loading…' }) {
  return <p className="fb fb-loading" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />{label}</p>;
}

export function ErrorNotice({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="fb fb-error" role="alert">
      <strong>{title}</strong>
      <p>{error?.message || 'Please try again.'}</p>
      {onRetry && <button type="button" className="btn" onClick={onRetry}>Retry</button>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="fb fb-empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

// Success message; the live region is always mounted so screen readers announce changes.
export function Success({ message }) {
  return <p className="fb fb-success" role="status" aria-live="polite">{message ? `✓ ${message}` : ''}</p>;
}
