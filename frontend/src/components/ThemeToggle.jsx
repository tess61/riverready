import { useEffect, useState } from 'react';
import { apply, followSystem, getSaved, save, systemTheme } from '../lib/theme.js';
import { MoonIcon, SunIcon } from './icons/index.jsx';

// Light/dark switch. Starts from the saved choice or the system setting; a click saves the choice.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getSaved() || systemTheme());

  useEffect(() => { apply(theme); }, [theme]);
  useEffect(() => followSystem(setTheme), []);

  const next = theme === 'dark' ? 'light' : 'dark';
  function toggle() { save(next); setTheme(next); }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {theme === 'dark' ? <SunIcon size={22} /> : <MoonIcon size={22} />}
    </button>
  );
}
