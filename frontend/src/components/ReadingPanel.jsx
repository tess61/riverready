import { lazy, Suspense } from 'react';
import { MeasureList, fmtDate } from './Reading.jsx';
import StatusChip from './StatusChip.jsx';
import { RetryButton } from './Feedback.jsx';
import { ClockIcon, WarningIcon, WifiOffIcon } from './icons/index.jsx';
import { getStatus, isStale, pickPrimary } from '../lib/status.js';

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
  return (
    <section className="panel panel-live" aria-labelledby="live-h">
      <h2 id="live-h">Live readings</h2>
      {status === 'ok' ? (
        <>
          {primary && (
            <div className="status-line">
              <StatusChip status={getStatus(primary)} large />
              <p className="meta">
                <ClockIcon size={16} />{primary.name}, updated {fmtDate(primary.latest.dateTime)}
              </p>
              {isStale(primary.latest.dateTime) && <p className="meta stale"><WarningIcon size={16} />Reading may be out of date</p>}
            </div>
          )}
          <MeasureList measures={external.data?.measures} />
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
