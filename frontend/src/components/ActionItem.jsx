import { CATEGORIES, PRIORITIES } from '../constants/actionTemplates.js';

const today = () => new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD, same format as due_date

export default function ActionItem({ action: a, busy, onToggle, onEdit, onDelete }) {
  const overdue = !a.is_done && a.due_date && a.due_date < today();
  return (
    <li className={`action${a.is_done ? ' is-done' : ''}`}>
      <label className="action-check">
        <input type="checkbox" checked={!!a.is_done} disabled={busy} onChange={onToggle} />
        <span className={a.is_done ? 'done' : ''}>{a.title}</span>
      </label>
      {a.description && <p className="muted small pre">{a.description}</p>}
      <p className="action-meta small">
        <span className="tag">{CATEGORIES[a.category] || a.category}</span>
        <span className={`tag tag-${a.priority}`}>{a.priority === 'high' ? '▲ ' : ''}{PRIORITIES[a.priority] || a.priority} priority</span>
        {a.due_date && <span className={`tag${overdue ? ' tag-overdue' : ''}`}>{overdue ? '⚠ Overdue · ' : ''}Due {a.due_date}</span>}
        {a.is_done && <span className="tag">✓ Done</span>}
      </p>
      <div className="actions">
        <button type="button" className="btn btn-small" onClick={onEdit} disabled={busy}>Edit</button>
        <button type="button" className="btn btn-small btn-danger" onClick={onDelete} disabled={busy}>Delete</button>
      </div>
    </li>
  );
}
