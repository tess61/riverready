// "X of Y done". The native <progress> stays for screen readers (visually hidden);
// the drawn bar is a plain div so its fill can animate the same way in every browser.
export default function ProgressBar({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="progress">
      <p className="progress-text">
        <span><strong className="progress-num">{done}</strong> of {total} done</span>
        <span className="progress-pct">{pct}%</span>
      </p>
      <div className="progress-track" aria-hidden="true">
        <span className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <progress className="visually-hidden" max={total || 1} value={done} aria-label={`${done} of ${total} actions done`} />
    </div>
  );
}
