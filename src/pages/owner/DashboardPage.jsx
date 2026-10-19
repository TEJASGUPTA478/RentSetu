import { useAuth } from '../../hooks/useAuth.jsx';
import './DashboardPage.css';

// Demo summary stats — will be replaced with real data in Step 2
const STATS = [
  { label: 'Total Properties', value: '3', sub: 'Across 2 cities' },
  { label: 'Active Tenants',   value: '11', sub: '2 vacancies' },
  { label: 'Rent Collected',   value: '₹1,12,000', sub: 'This month' },
  { label: 'Pending Dues',     value: '₹18,500', sub: 'From 3 tenants' },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'Rent',        desc: 'Rajesh Sharma paid rent for Oct 2024',    time: '2 hours ago',   status: 'success' },
  { id: 2, type: 'Maintenance', desc: 'Unit 2B: Water leakage reported',          time: '5 hours ago',   status: 'warning' },
  { id: 3, type: 'Bill',        desc: 'Electricity bill generated for Block A',   time: 'Yesterday',     status: 'info' },
  { id: 4, type: 'Rent',        desc: 'Anita Joshi payment overdue by 5 days',   time: '2 days ago',    status: 'danger' },
  { id: 5, type: 'Tenant',      desc: 'New tenant Priya Mehta agreement signed',  time: '3 days ago',    status: 'success' },
];

const STATUS_COLOR = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-muted',
};

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  return (
    <div className="dashboard-page">

      {/* ── Page header ── */}
      <div className="dashboard-top">
        <div>
          <h1 className="dashboard-greeting">{greeting}, {firstName}.</h1>
          <p className="dashboard-date">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="dashboard-stats">
        {STATS.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="dashboard-body">

        {/* Recent activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading">Recent Activity</h2>
            <span className="text-xs text-muted">Last 7 days</span>
          </div>
          <div className="activity-list">
            {RECENT_ACTIVITY.map(item => (
              <div className="activity-item" key={item.id}>
                <div className="activity-main">
                  <span className={`badge ${STATUS_COLOR[item.status]}`}>{item.type}</span>
                  <span className="activity-desc">{item.desc}</span>
                </div>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-heading">Quick Actions</h2>
          </div>
          <div className="quick-links">
            <button className="quick-link-btn" disabled title="Coming soon">
              Record Rent Payment
            </button>
            <button className="quick-link-btn" disabled title="Coming soon">
              Add New Tenant
            </button>
            <button className="quick-link-btn" disabled title="Coming soon">
              Generate Bill
            </button>
            <button className="quick-link-btn" disabled title="Coming soon">
              Log Expense
            </button>
          </div>
          <p className="text-xs text-muted" style={{ marginTop: 'var(--space-3)' }}>
            Full functionality will be enabled in the next update.
          </p>
        </div>

      </div>
    </div>
  );
}
