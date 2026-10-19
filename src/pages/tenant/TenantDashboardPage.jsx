import { useAuth } from '../../hooks/useAuth.jsx';
import './TenantDashboardPage.css';

const TENANT_STATS = [
  { label: 'Rent Due',       value: '₹12,000', sub: 'Due on 5th Nov' },
  { label: 'Last Payment',   value: '₹12,000', sub: 'Paid 5 Oct 2024' },
  { label: 'Open Requests',  value: '1',        sub: 'Maintenance' },
  { label: 'Pending Bills',  value: '2',        sub: 'Electricity, Water' },
];

const RECENT_ITEMS = [
  { id: 1, label: 'October rent paid',           date: '5 Oct 2024',    status: 'Paid',     statusClass: 'badge-success' },
  { id: 2, label: 'Electricity bill generated',  date: '1 Oct 2024',    status: 'Pending',  statusClass: 'badge-warning' },
  { id: 3, label: 'Water bill generated',        date: '1 Oct 2024',    status: 'Pending',  statusClass: 'badge-warning' },
  { id: 4, label: 'Maintenance: fan not working', date: '28 Sep 2024',  status: 'Open',     statusClass: 'badge-muted' },
];

export default function TenantDashboardPage() {
  const { currentUser } = useAuth();
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  return (
    <div className="tenant-dashboard">
      <div className="tenant-dashboard-inner">

        <div className="tenant-dash-header">
          <h1 className="tenant-dash-greeting">Hello, {firstName}.</h1>
          <p className="tenant-dash-unit">Unit 2B · Sharma Properties, Pune</p>
        </div>

        <div className="tenant-stats">
          {TENANT_STATS.map(s => (
            <div className="t-stat-card" key={s.label}>
              <div className="t-stat-label">{s.label}</div>
              <div className="t-stat-value">{s.value}</div>
              <div className="t-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="tenant-dash-section">
          <h2 className="section-heading">Recent Activity</h2>
          <div className="tenant-activity-list">
            {RECENT_ITEMS.map(item => (
              <div className="tenant-activity-item" key={item.id}>
                <div className="tenant-activity-left">
                  <span className="tenant-activity-label">{item.label}</span>
                  <span className="tenant-activity-date">{item.date}</span>
                </div>
                <span className={`badge ${item.statusClass}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
