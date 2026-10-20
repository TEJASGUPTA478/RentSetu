import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import './DashboardPage.css';

const PROPERTIES = [
  {
    id: 1,
    name: 'Green Valley Apartments',
    location: 'Noida, Uttar Pradesh',
    units: 12,
    occupied: 10,
    expected: 150000,
    collected: 135000,
  },
  {
    id: 2,
    name: 'Sunrise Residency',
    location: 'Ghaziabad, Uttar Pradesh',
    units: 8,
    occupied: 7,
    expected: 98000,
    collected: 73500,
  },
  {
    id: 3,
    name: 'Sharma House',
    location: 'Delhi',
    units: 5,
    occupied: 4,
    expected: 52000,
    collected: 45000,
  },
];

const RECENT_PAYMENTS = [
  {
    id: 1,
    tenant: 'Rajesh Sharma',
    property: 'Green Valley Apartments',
    unit: 'A-204',
    amount: 15000,
    date: '18 Oct',
    status: 'Paid',
  },
  {
    id: 2,
    tenant: 'Priya Mehta',
    property: 'Sunrise Residency',
    unit: 'B-103',
    amount: 12000,
    date: '17 Oct',
    status: 'Paid',
  },
  {
    id: 3,
    tenant: 'Amit Verma',
    property: 'Green Valley Apartments',
    unit: 'A-102',
    amount: 14000,
    date: '16 Oct',
    status: 'Paid',
  },
  {
    id: 4,
    tenant: 'Neha Singh',
    property: 'Sharma House',
    unit: '1st Floor',
    amount: 11000,
    date: '15 Oct',
    status: 'Partial',
  },
];

const ATTENTION_ITEMS = [
  {
    id: 1,
    tenant: 'Anita Joshi',
    unit: 'B-104',
    issue: 'Rent overdue',
    amount: 12500,
    type: 'rent',
  },
  {
    id: 2,
    tenant: 'Rajesh Sharma',
    unit: 'A-204',
    issue: 'Electricity bill pending',
    amount: 2340,
    type: 'bill',
  },
  {
    id: 3,
    tenant: 'Priya Mehta',
    unit: 'B-103',
    issue: 'Maintenance request',
    amount: null,
    type: 'maintenance',
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [propertyFilter, setPropertyFilter] = useState('all');

  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  const totals = useMemo(() => {
    return PROPERTIES.reduce(
      (acc, property) => {
        acc.units += property.units;
        acc.occupied += property.occupied;
        acc.expected += property.expected;
        acc.collected += property.collected;
        return acc;
      },
      {
        units: 0,
        occupied: 0,
        expected: 0,
        collected: 0,
      }
    );
  }, []);

  const pending = totals.expected - totals.collected;
  const occupancy = Math.round((totals.occupied / totals.units) * 100);
  const collectionRate = Math.round(
    (totals.collected / totals.expected) * 100
  );

  const visiblePayments =
    propertyFilter === 'all'
      ? RECENT_PAYMENTS
      : RECENT_PAYMENTS.filter((payment) => {
          const property = PROPERTIES.find(
            (item) => item.id.toString() === propertyFilter
          );

          return property?.name === payment.property;
        });

  return (
    <div className="dashboard-page">
      <header className="dashboard-top">
        <div>
          <p className="dashboard-eyebrow">PROPERTY OVERVIEW</p>

          <h1 className="dashboard-greeting">
            Good morning, {firstName}.
          </h1>

          <p className="dashboard-date">
            Sunday, 18 October 2026
          </p>
        </div>

        <button className="dashboard-primary-action">
          + Record payment
        </button>
      </header>

      {/* Main financial snapshot */}
      <section className="dashboard-summary">
        <div className="summary-card summary-card-main">
          <div className="summary-card-top">
            <span>Rent collected</span>
            <span className="summary-period">October 2026</span>
          </div>

          <strong>{formatCurrency(totals.collected)}</strong>

          <div className="collection-track">
            <div
              className="collection-progress"
              style={{ width: `${collectionRate}%` }}
            />
          </div>

          <div className="summary-bottom">
            <span>{collectionRate}% collected</span>
            <span>{formatCurrency(pending)} pending</span>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-label">Occupied units</span>

          <strong>
            {totals.occupied}
            <small> / {totals.units}</small>
          </strong>

          <span className="summary-note">
            {occupancy}% occupancy
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Expected rent</span>

          <strong>{formatCurrency(totals.expected)}</strong>

          <span className="summary-note">
            Current month
          </span>
        </div>
      </section>

      {/* Main grid */}
      <div className="dashboard-grid">
        <section className="dashboard-panel property-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">YOUR PROPERTIES</p>
              <h2>Property performance</h2>
            </div>

            <button className="text-button">
              View all
            </button>
          </div>

          <div className="property-list">
            {PROPERTIES.map((property) => {
              const percentage = Math.round(
                (property.collected / property.expected) * 100
              );

              return (
                <div className="property-row" key={property.id}>
                  <div className="property-info">
                    <div className="property-mark">
                      {property.name.charAt(0)}
                    </div>

                    <div>
                      <h3>{property.name}</h3>
                      <p>{property.location}</p>
                    </div>
                  </div>

                  <div className="property-numbers">
                    <span>
                      {property.occupied}/{property.units} occupied
                    </span>

                    <strong>
                      {formatCurrency(property.collected)}
                    </strong>

                    <div className="mini-progress">
                      <span style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Attention */}
        <section className="dashboard-panel attention-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">ACTION NEEDED</p>
              <h2>Needs attention</h2>
            </div>

            <span className="attention-count">
              {ATTENTION_ITEMS.length}
            </span>
          </div>

          <div className="attention-list">
            {ATTENTION_ITEMS.map((item) => (
              <div className="attention-item" key={item.id}>
                <div className={`attention-dot ${item.type}`} />

                <div className="attention-content">
                  <strong>{item.tenant}</strong>

                  <span>
                    {item.unit} · {item.issue}
                  </span>
                </div>

                {item.amount && (
                  <span className="attention-amount">
                    {formatCurrency(item.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button className="panel-footer-button">
            Open maintenance & rent →
          </button>
        </section>
      </div>

      {/* Payments */}
      <section className="dashboard-panel payments-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">RECENT ACTIVITY</p>
            <h2>Latest payments</h2>
          </div>

          <select
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
            className="dashboard-select"
          >
            <option value="all">All properties</option>

            {PROPERTIES.map((property) => (
              <option
                value={property.id}
                key={property.id}
              >
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div className="payments-table">
          <div className="payment-table-head">
            <span>Tenant</span>
            <span>Property / Unit</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          {visiblePayments.map((payment) => (
            <div className="payment-row" key={payment.id}>
              <div className="payment-tenant">
                <span className="tenant-avatar">
                  {payment.tenant.charAt(0)}
                </span>

                <strong>{payment.tenant}</strong>
              </div>

              <span className="payment-property">
                {payment.property}
                <small>{payment.unit}</small>
              </span>

              <span className="payment-date">
                {payment.date}
              </span>

              <strong className="payment-amount">
                {formatCurrency(payment.amount)}
              </strong>

              <span
                className={`payment-status ${
                  payment.status === 'Paid'
                    ? 'paid'
                    : 'partial'
                }`}
              >
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}