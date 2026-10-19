import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, Gauge,
  FileText, Wrench, TrendingDown, BarChart3, Settings,
  HelpCircle, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import './OwnerLayout.css';

const NAV_ITEMS = [
  { label: 'Dashboard',   to: '/dashboard',   icon: LayoutDashboard },
  { label: 'Properties',  to: '/properties',  icon: Building2 },
  { label: 'Tenants',     to: '/tenants',     icon: Users },
  { label: 'Rent',        to: '/rent',        icon: CreditCard },
  { label: 'Meters',      to: '/meters',      icon: Gauge },
  { label: 'Bills',       to: '/bills',       icon: FileText },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Expenses',    to: '/expenses',    icon: TrendingDown },
  { label: 'Reports',     to: '/reports',     icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Help',     to: '/help',     icon: HelpCircle },
];

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        className={({ isActive }) => `owner-nav-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        <Icon size={17} strokeWidth={1.75} />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

export default function OwnerLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    function handleClick(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const closeDrawer = () => setDrawerOpen(false);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="owner-layout">

      {/* ── Sidebar (desktop) ── */}
      <aside className="owner-sidebar">
        <div className="owner-sidebar-brand">
          <span className="brand-dot" />
          <span className="brand-name">RentSetu</span>
        </div>

        <nav className="owner-sidebar-nav">
          <ul className="owner-nav-list">
            {NAV_ITEMS.map(item => (
              <NavItem key={item.to} item={item} />
            ))}
          </ul>

          <div className="owner-nav-divider" />

          <ul className="owner-nav-list">
            {BOTTOM_ITEMS.map(item => (
              <NavItem key={item.to} item={item} />
            ))}
          </ul>
        </nav>

        <div className="owner-sidebar-user">
          <div className="user-avatar" aria-hidden="true">{initials}</div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">
              {currentUser?.role === 'manager' ? 'Property Manager' : 'Owner'}
            </span>
          </div>
          <button
            className="user-logout-btn"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {drawerOpen && (
        <div className="owner-drawer-overlay" aria-hidden="true" />
      )}

      {/* ── Drawer (mobile) ── */}
      <aside
        ref={drawerRef}
        className={`owner-drawer ${drawerOpen ? 'open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div className="owner-drawer-header">
          <div className="owner-sidebar-brand">
            <span className="brand-dot" />
            <span className="brand-name">RentSetu</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="owner-sidebar-nav">
          <ul className="owner-nav-list">
            {NAV_ITEMS.map(item => (
              <NavItem key={item.to} item={item} onClick={closeDrawer} />
            ))}
          </ul>

          <div className="owner-nav-divider" />

          <ul className="owner-nav-list">
            {BOTTOM_ITEMS.map(item => (
              <NavItem key={item.to} item={item} onClick={closeDrawer} />
            ))}
          </ul>
        </nav>

        <div className="owner-sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">Owner</span>
          </div>
          <button className="user-logout-btn" onClick={handleLogout} title="Sign out">
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="owner-main">
        {/* Top header (mobile) */}
        <header className="owner-header">
          <button
            className="header-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <div className="owner-sidebar-brand header-brand">
            <span className="brand-dot" />
            <span className="brand-name">RentSetu</span>
          </div>
          <div className="header-user-avatar" aria-hidden="true">{initials}</div>
        </header>

        {/* Page content */}
        <main className="owner-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
