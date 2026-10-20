const STATUS_CLASS_MAP = {
  Paid: 'badge-success',
  Resolved: 'badge-success',
  Active: 'badge-success',
  Partial: 'badge-warning',
  Pending: 'badge-warning',
  'Payment pending': 'badge-warning',
  'In Progress': 'badge-warning',
  'Medium priority': 'badge-warning',
  Overdue: 'badge-danger',
  'Rent overdue': 'badge-danger',
  'High priority': 'badge-danger',
  Open: 'badge-muted',
  'Low priority': 'badge-muted',
};

export default function StatusBadge({ status, children }) {
  const label = children ?? status;
  const variant = STATUS_CLASS_MAP[status] || 'badge-muted';

  return <span className={`badge ${variant}`}>{label}</span>;
}