import { CheckIcon, RefreshIcon, WarningIcon } from './icons/index.jsx';

// Small shared states. Errors use role=alert; polite status uses aria-live.
// `skeleton` ("cards" | "detail") adds placeholder shapes; the text label is what screen readers hear.
export function Loading({ label = 'Loading…', skeleton }) {
  return (
    <div className="fb-loading-wrap">
      <p className="fb fb-loading" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />{label}</p>
      {skeleton === 'cards' && (
        <div className="skel-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => <div key={i} className="skel skel-card"><span /><span /><span /></div>)}
        </div>
      )}
      {skeleton === 'detail' && (
        <div aria-hidden="true">
          <div className="skel skel-title"><span /></div>
          <div className="skel skel-panel"><span /><span /><span /></div>
          <div className="skel skel-panel"><span /><span /></div>
        </div>
      )}
    </div>
  );
}

export function RetryButton({ onClick, children = 'Retry' }) {
  return <button type="button" className="btn" onClick={onClick}><RefreshIcon size={18} />{children}</button>;
}

export function ErrorNotice({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="fb fb-error" role="alert">
      <WarningIcon className="fb-icon" size={24} />
      <div>
        <strong>{title}</strong>
        <p>{error?.message || 'Please try again.'}</p>
        {onRetry && <RetryButton onClick={onRetry} />}
      </div>
    </div>
  );
}

// `art` is an optional decorative illustration shown above the text.
export function Empty({ title, children, art }) {
  return (
    <div className={`fb fb-empty${art ? ' has-art' : ''}`}>
      {art}
      <div>
        <strong>{title}</strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}

// Success message; the live region is always mounted so screen readers announce changes.
export function Success({ message }) {
  return (
    <p className="fb fb-success" role="status" aria-live="polite">
      {message && <><CheckIcon size={18} />{message}</>}
    </p>
  );
}
