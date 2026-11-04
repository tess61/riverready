// "X of Y done" with a native <progress> (announced by screen readers) and a visible text count.
export default function ProgressBar({ done, total }) {
  return (
    <div className="progress">
      <p className="progress-text"><strong>{done} of {total}</strong> done</p>
      <progress max={total || 1} value={done} aria-label={`${done} of ${total} actions done`} />
    </div>
  );
}
