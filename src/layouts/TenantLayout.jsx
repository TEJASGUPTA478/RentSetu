import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, FileText, Wallet, Wrench,
  User, LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import './TenantLayout.css';

const NAV_ITEMS = [
  { label: 'Home',        to: '/tenant/dashboard',   icon: LayoutDashboard },
  { label: 'Rent',        to: '/tenant/rent',         icon: CreditCard },
  { label: 'Bills',       to: '/tenant/bills',        icon: FileText },
  { label: 'Payments',    to: '/tenant/payments',     icon: Wallet },
  { label: 'Maintenance', to: '/tenant/maintenance',  icon: Wrench },
  { label: 'Profile',     to: '/tenant/profile',      icon: User },
];

function TopNavLink({ item }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/tenant/dashboard'}
        className={({ isActive }) => `tenant-top-link ${isActive ? 'active' : ''}`}
      >
        <Icon size={16} strokeWidth={1.75} />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

function BottomNavLink({ item }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/tenant/dashboard'}
        className={({ isActive }) => `tenant-bottom-link ${isActive ? 'active' : ''}`}
      >
        <Icon size={20} strokeWidth={1.75} />
        <span className="bottom-nav-label">{item.label}</span>
      </NavLink>
    </li>
  );
}

export default function TenantLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'T';

  return (
    <div className="tenant-layout">

      {/* ── Top navigation ── */}
      <header className="tenant-header">
        <div className="tenant-header-inner">
          <div className="tenant-brand">
            <span className="brand-dot-t" />
            <span className="tenant-brand-name">RentSetu</span>
          </div>

          <nav className="tenant-top-nav" aria-label="Tenant navigation">
            <ul className="tenant-top-nav-list">
              {NAV_ITEMS.map(item => (
                <TopNavLink key={item.to} item={item} />
              ))}
            </ul>
          </nav>

          <div className="tenant-header-actions">
            <div className="tenant-user-info">
              <span className="tenant-user-name">{currentUser?.name}</span>
            </div>
            <div className="tenant-avatar" aria-hidden="true">{initials}</div>
            <button
              className="tenant-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="tenant-main">
        <Outlet />
      </main>

      {/* ── Bottom navigation (mobile) ── */}
      <nav className="tenant-bottom-nav" aria-label="Mobile navigation">
        <ul className="tenant-bottom-nav-list">
          {NAV_ITEMS.map(item => (
            <BottomNavLink key={item.to} item={item} />
          ))}
        </ul>
      </nav>

    </div>
  );
}
