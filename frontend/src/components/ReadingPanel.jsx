import { lazy, Suspense } from 'react';
import { MeasureList, fmtDate } from './Reading.jsx';
import ReadingHero from './ReadingHero.jsx';
import { RetryButton } from './Feedback.jsx';
import { WifiOffIcon } from './icons/index.jsx';
import { pickPrimary } from '../lib/status.js';

const TrendPanel = lazy(() => import('./TrendPanel.jsx')); // separate chunk, only fetched on this page

// Live EA panel for the detail page. `external` is the overview's { status, data, fetchedAt }.
// Anything other than "ok" keeps the page usable with an inline notice.
export default function ReadingPanel({ external, onRetry }) {
  const status = external?.status;
  const messages = {
    unavailable: 'Live data unavailable.',
    timeout: 'Live data unavailable (the Environment Agency took too long to respond).',
    empty: 'The Environment Agency has no readings for this station right now.',
  };
  const primary = status === 'ok' ? pickPrimary(external.data?.measures) : null;
  // The hero shows the main measure; any others are listed under it (all of them if none has a reading).
  const others = status === 'ok' ? (external.data?.measures || []).filter((x) => x !== primary) : [];
  return (
    <section className="panel panel-live" aria-labelledby="live-h">
      <h2 id="live-h">Live readings</h2>
      {status === 'ok' ? (
        <>
          {primary && <ReadingHero measure={primary} />}
          {(!primary || others.length > 0) && (
            <>
              {primary && <p className="hero-label">Other measurements</p>}
              <MeasureList measures={others} />
            </>
          )}
          {primary?.id && (
            <Suspense fallback={<p className="muted small">Loading trend…</p>}>
              <TrendPanel measure={primary} />
            </Suspense>
          )}
          <p className="source small">Source: Environment Agency. Fetched {fmtDate(external.fetchedAt)}.</p>
        </>
      ) : (
        <div className="fb fb-warn" role="status" aria-live="polite">
          <WifiOffIcon className="fb-icon" size={24} />
          <div>
            <p>{messages[status] || messages.unavailable}</p>
            <RetryButton onClick={onRetry} />
          </div>
        </div>
      )}
    </section>
  );
}
