// Status as icon + text + colour. The text is always present so colour is never the only signal.
export default function StatusChip({ status }) {
  return (
    <span className={`chip chip-${status.key}`}>
      <span aria-hidden="true">{status.icon}</span> {status.label}
    </span>
  );
}
