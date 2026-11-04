import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Disclaimer from './Disclaimer.jsx';

// Shell: skip link, header nav, page outlet, always-visible disclaimer footer.
export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null);
  // Move focus to <main> on navigation so keyboard/screen-reader users land on new content.
  useEffect(() => { main.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <NavLink to="/" className="brand">RiverReady</NavLink>
        <nav aria-label="Main">
          <NavLink to="/" end>My locations</NavLink>
          <NavLink to="/search">Find a station</NavLink>
        </nav>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="page">
        <Outlet />
      </main>
      <Disclaimer />
    </div>
  );
}
