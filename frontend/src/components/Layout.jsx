import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Loading } from './Feedback.jsx';
import Disclaimer from './Disclaimer.jsx';
import RiverBand from './RiverBand.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { PinIcon, SearchIcon, WaveIcon } from './icons/index.jsx';

// Shell: skip link, header (brand, nav, theme toggle, river artwork), page outlet, always-visible disclaimer.
export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null);
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
  const home = pathname === '/';
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className={`site-header${home ? ' is-home' : ''}`}>
        <div className="header-row">
          <NavLink to="/" className="brand">
            <span className="brand-mark"><WaveIcon size={20} /></span>
            RiverReady
          </NavLink>
          <nav aria-label="Main" className="main-nav">
            <NavLink to="/" end><PinIcon size={18} />My locations</NavLink>
            <NavLink to="/search"><SearchIcon size={18} />Find a station</NavLink>
          </nav>
          <ThemeToggle />
        </div>
        <RiverBand tall={home} />
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
