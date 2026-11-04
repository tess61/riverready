import { useState } from 'react';
import { api } from '../api/client.js';
import { ACTION_TEMPLATES } from '../constants/actionTemplates.js';

// Local copy of a location's actions plus the API calls that change it.
// Each change waits for the server, then updates the list, so the UI never shows unsaved state.
export function useActions(locationId, initial) {
  const [actions, setActions] = useState(initial);
  const [busyId, setBusyId] = useState(null); // id of the action being changed (or 'bulk')
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  async function guard(id, fn) {
    setBusyId(id); setError(null); setNotice('');
    try { await fn(); } catch (e) { setError(e); } finally { setBusyId(null); }
  }

  const toggle = (a) => guard(a.id, async () => {
    const saved = await api.updateAction(a.id, { is_done: !a.is_done });
    setActions((list) => list.map((x) => (x.id === a.id ? saved : x)));
  });

  const remove = (a) => guard(a.id, async () => {
    await api.deleteAction(a.id);
    setActions((list) => list.filter((x) => x.id !== a.id));
    setNotice('Action deleted.');
  });

  // Used by the form: errors are thrown back so the form can show field errors.
  async function save(data, id) {
    setError(null); setNotice('');
    if (id) {
      const saved = await api.updateAction(id, data);
      setActions((list) => list.map((x) => (x.id === id ? saved : x)));
      setNotice('Action updated.');
    } else {
      const saved = await api.createAction(locationId, data);
      setActions((list) => [...list, saved]);
      setNotice('Action added.');
    }
  }

  // One POST at a time (no burst of parallel requests); titles already present are skipped.
  const addTemplates = () => guard('bulk', async () => {
    const have = new Set(actions.map((a) => a.title.trim().toLowerCase()));
    const todo = ACTION_TEMPLATES.filter((t) => !have.has(t.title.toLowerCase()));
    let added = 0;
    try {
      for (const t of todo) {
        const saved = await api.createAction(locationId, t);
        setActions((list) => [...list, saved]);
        added += 1;
      }
    } finally {
      setNotice(todo.length === 0 ? 'All suggested actions are already in your list.' : `Added ${added} of ${todo.length} suggested actions.`);
    }
  });

  return { actions, busyId, error, notice, toggle, remove, save, addTemplates };
}
