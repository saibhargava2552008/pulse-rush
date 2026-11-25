import { useState } from 'react';
import { Link, useRoute } from '../router';
import type { AppRoute } from '../router';

interface NavItem {
  to: AppRoute;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Play Game' },
  { to: '/guide', label: 'Game Guide' },
  { to: '/strategy', label: 'Strategy' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const currentRoute = useRoute();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="site-header" role="banner">
      <div className="site-header__container">
        <Link to="/" className="site-header__brand" onClick={closeMobile} aria-label="Pulse Rush Home">
          <span className="brand-pulse">Pulse</span>
          <span className="brand-rush">Rush</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="site-header__nav" aria-label="Primary Navigation">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const isActive = currentRoute === item.to;
              return (
                <li key={item.to} className="nav-item">
                  <Link
                    to={item.to}
                    className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={toggleMobile}
        >
          <span className={`toggle-icon ${mobileOpen ? 'toggle-icon--open' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="site-header__drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <nav aria-label="Mobile Navigation Links">
            <ul className="drawer-list">
              {NAV_ITEMS.map((item) => {
                const isActive = currentRoute === item.to;
                return (
                  <li key={item.to} className="drawer-item">
                    <Link
                      to={item.to}
                      className={`drawer-link ${isActive ? 'drawer-link--active' : ''}`}
                      onClick={closeMobile}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="drawer-item drawer-item--legal">
                <Link to="/privacy" className="drawer-link" onClick={closeMobile}>Privacy Policy</Link>
              </li>
              <li className="drawer-item drawer-item--legal">
                <Link to="/terms" className="drawer-link" onClick={closeMobile}>Terms of Service</Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
