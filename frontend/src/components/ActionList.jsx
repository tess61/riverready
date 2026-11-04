import { useState } from 'react';
import { useActions } from '../hooks/useActions.js';
import { CATEGORIES } from '../constants/actionTemplates.js';
import { ErrorNotice, Empty, Success } from './Feedback.jsx';
import ActionForm from './ActionForm.jsx';
import ActionItem from './ActionItem.jsx';
import ProgressBar from './ProgressBar.jsx';
import { AddIcon, ChecklistIcon, SparkIcon } from './icons/index.jsx';

// Checklist for one location: progress, category filter, add/edit/delete, done toggle, starter list.
export default function ActionList({ locationId, initial }) {
  const { actions, busyId, error, notice, toggle, remove, save, addTemplates } = useActions(locationId, initial);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(null); // null = closed, 'new', or the action being edited

  const done = actions.filter((a) => a.is_done).length;
  const shown = filter === 'all' ? actions : actions.filter((a) => a.category === filter);
  const used = Object.keys(CATEGORIES).filter((c) => actions.some((a) => a.category === c));

  const confirmRemove = (a) => { if (window.confirm(`Delete the action “${a.title}”?`)) remove(a); };
  const submit = async (data) => { await save(data, form === 'new' ? null : form.id); setForm(null); };

  return (
    <section className="panel panel-actions" aria-labelledby="act-h">
      <h2 id="act-h" className="panel-title"><ChecklistIcon size={24} />Preparedness actions</h2>
      {actions.length > 0 && <ProgressBar done={done} total={actions.length} />}
      <Success message={notice} />
      {error && <ErrorNotice error={error} title="Could not update actions" />}

      {used.length > 1 && (
        <div className="filters" role="group" aria-label="Filter by category">
          {['all', ...used].map((c) => (
            <button key={c} type="button" className="filter" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c === 'all' ? `All (${actions.length})` : `${CATEGORIES[c]} (${actions.filter((a) => a.category === c).length})`}
            </button>
          ))}
        </div>
      )}

      {actions.length === 0 && form === null && (
        <Empty title="No actions yet.">Add your own, or start from a list of generic ideas you can edit.</Empty>
      )}
      {shown.length > 0 && (
        <ul className="action-list">
          {shown.map((a) => (
            <ActionItem key={a.id} action={a} busy={busyId === a.id || busyId === 'bulk'}
              onToggle={() => toggle(a)} onEdit={() => setForm(a)} onDelete={() => confirmRemove(a)} />
          ))}
        </ul>
      )}

      {form !== null
        ? <ActionForm key={form === 'new' ? 'new' : form.id} initial={form === 'new' ? null : form} onSubmit={submit} onCancel={() => setForm(null)} />
        : (
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => setForm('new')}><AddIcon size={18} />Add action</button>
            <button type="button" className="btn" onClick={addTemplates} disabled={busyId === 'bulk'}>
              <SparkIcon size={18} />{busyId === 'bulk' ? 'Adding…' : 'Add suggested actions'}
            </button>
          </div>
        )}
      <p className="muted small panel-foot">Suggested actions are generic ideas only. They are not official advice.</p>
    </section>
  );
}
