import { MeasureList } from './Reading.jsx';
import { fmtDate } from './Reading.jsx';

// Live EA panel for the detail page. `external` is the overview's { status, data, fetchedAt }.
// Anything other than "ok" keeps the page usable with an inline notice.
export default function ReadingPanel({ external, onRetry }) {
  const status = external?.status;
  const messages = {
    unavailable: 'Live data unavailable.',
    timeout: 'Live data unavailable (the Environment Agency took too long to respond).',
    empty: 'The Environment Agency has no readings for this station right now.',
  };
  return (
    <section className="panel" aria-labelledby="live-h">
      <h2 id="live-h">Live readings</h2>
      {status === 'ok' ? (
        <>
          <MeasureList measures={external.data?.measures} />
          <p className="muted small">Source: Environment Agency · fetched {fmtDate(external.fetchedAt)}</p>
        </>
      ) : (
        <div className="fb fb-warn" role="status" aria-live="polite">
          <p>{messages[status] || messages.unavailable}</p>
          <button type="button" className="btn" onClick={onRetry}>Retry</button>
        </div>
      )}
    </section>
  );
}
