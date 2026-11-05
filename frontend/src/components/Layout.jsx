import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Loading } from './Feedback.jsx';
import Disclaimer from './Disclaimer.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useLiquidGlassAll } from '../hooks/useLiquidGlass.js';
import { PinIcon, SearchIcon, WaveIcon } from './icons/index.jsx';

// Shell: skip link, sticky header (brand, nav, theme toggle as separate glass pills), page outlet, disclaimer.
// The river-currents backdrop behind everything is pure CSS (body::before in base.css).
export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null);
  useLiquidGlassAll(); // every button, nav pill, card and panel gets its own liquid glass
  const prev = useRef(pathname);
  const [moved, setMoved] = useState(false); // true after the first route change: enables the page-enter animation
  // When the route changes, move focus to <main> so keyboard/screen-reader users land on new content.
  // Not on first load (path unchanged): there the skip link must stay the first Tab stop.
  // Comparing paths (not a "first run" flag) also behaves correctly under StrictMode's double effects.
  // Layout effect (runs before paint) so the first animated page never flashes un-animated.
  useLayoutEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    setMoved(true);
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      {/* The header sticks to the top; page content scrolls underneath its glass pills. */}
      <header className="site-header">
        <div className="header-row">
          <NavLink to="/" className="brand">
            <span className="brand-mark"><WaveIcon size={15} /></span>
            RiverReady
          </NavLink>
          <nav aria-label="Main" className="main-nav">
            <NavLink to="/" end><PinIcon size={18} />My locations</NavLink>
            <NavLink to="/search"><SearchIcon size={18} />Find a station</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="page">
        {/* Keyed wrapper: the new page "rises" in on each route change (CSS only, off under reduced motion). */}
        <div className={`page-enter${moved ? ' is-moving' : ''}`} key={pathname}>
          {/* Page chunks load lazily; this boundary keeps the header and footer on screen meanwhile. */}
          <Suspense fallback={<Loading label="Loading page…" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
}
