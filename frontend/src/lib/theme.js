// Theme helpers. index.html sets the first theme before paint; these keep it in sync afterwards.
const KEY = 'rr-theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

// localStorage can throw (private mode, blocked storage), so every access is guarded.
export function getSaved() {
  try { const t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : null; } catch { return null; }
}

export function save(theme) {
  try { localStorage.setItem(KEY, theme); } catch { /* not saved; the theme still applies for this visit */ }
}

export const systemTheme = () => (media().matches ? 'dark' : 'light');

// Apply to <html data-theme> and point the status-bar colour at the page background colour.
export function apply(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && bg) meta.setAttribute('content', bg);
}

// Follow system changes only while the user has not picked a theme. Returns an unsubscribe function.
export function followSystem(onChange) {
  const mq = media();
  const handler = () => { if (!getSaved()) onChange(systemTheme()); };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
