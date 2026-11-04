import { CATEGORIES, PRIORITIES } from '../constants/actionTemplates.js';
import { ArrowUpBoldIcon, CheckIcon, ClockIcon, DeleteIcon, EditIcon, WarningIcon } from './icons/index.jsx';

const today = () => new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD, same format as due_date

export default function ActionItem({ action: a, busy, onToggle, onEdit, onDelete }) {
  const overdue = !a.is_done && a.due_date && a.due_date < today();
  return (
    <li className={`action prio-${a.priority}${a.is_done ? ' is-done' : ''}`}>
      <label className="action-check">
        <input type="checkbox" checked={!!a.is_done} disabled={busy} onChange={onToggle} />
        <span className="action-title">{a.title}</span>
      </label>
      {a.description && <p className="action-desc muted small pre">{a.description}</p>}
      <p className="action-meta small">
        <span className={`tag cat-${a.category}`}>{CATEGORIES[a.category] || a.category}</span>
        <span className={`tag tag-${a.priority}`}>{a.priority === 'high' && <ArrowUpBoldIcon size={14} />}{PRIORITIES[a.priority] || a.priority} priority</span>
        {a.due_date && (
          <span className={`tag${overdue ? ' tag-overdue' : ''}`}>
            {overdue ? <WarningIcon size={14} /> : <ClockIcon size={14} />}
            {overdue ? 'Overdue, due ' : 'Due '}{a.due_date}
          </span>
        )}
        {!!a.is_done && <span className="tag tag-done"><CheckIcon size={14} />Done</span>}
      </p>
      <div className="action-buttons">
        <button type="button" className="btn btn-small btn-ghost" onClick={onEdit} disabled={busy}><EditIcon size={18} />Edit</button>
        <button type="button" className="btn btn-small btn-ghost btn-danger" onClick={onDelete} disabled={busy}><DeleteIcon size={18} />Delete</button>
      </div>
    </li>
  );
}
