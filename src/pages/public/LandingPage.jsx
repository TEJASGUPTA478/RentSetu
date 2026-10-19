import { Link } from 'react-router-dom';
import { Building2, Users, FileText, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const OWNER_FEATURES = [
  'Track rent collection across all properties',
  'Manage utility meter readings and bills',
  'Maintenance request tracking',
  'Expense recording and reports',
];

const TENANT_FEATURES = [
  'View rent and payment history',
  'Download monthly bills',
  'Submit and track maintenance requests',
  'Access all your tenancy documents',
];

export default function LandingPage() {
  return (
    <div className="landing-page">

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <span className="landing-brand-dot" />
            <span className="landing-brand-name">RentSetu</span>
          </div>
          <div className="landing-header-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-tag">Property Management Software</div>
          <h1 className="hero-headline">
            Rental management,<br />
            without the paperwork.
          </h1>
          <p className="hero-subtext">
            RentSetu helps property owners, managers and tenants stay organised —
            rent tracking, bills, maintenance and more, in one place.
          </p>
          <div className="hero-cta-row">
            <Link to="/register" className="btn btn-primary btn-lg" id="cta-register">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" id="cta-signin">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="landing-strip">
        <div className="landing-container landing-strip-inner">
          <span>Used by property owners across India</span>
          <span className="strip-sep">·</span>
          <span>Manage multiple properties</span>
          <span className="strip-sep">·</span>
          <span>Owner, manager and tenant access</span>
        </div>
      </div>

      {/* ── Value propositions ── */}
      <section className="landing-values">
        <div className="landing-container">
          <div className="values-grid">

            {/* For Owners */}
            <div className="value-card" id="value-owners">
              <div className="value-card-header">
                <div className="value-icon">
                  <Building2 size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="value-tag">For Owners & Managers</div>
                  <h2 className="value-title">Run your properties<br />without chaos</h2>
                </div>
              </div>
              <p className="value-desc">
                Keep rent records, utility bills and maintenance requests in one
                system. No more spreadsheets, no more missed follow-ups.
              </p>
              <ul className="value-list">
                {OWNER_FEATURES.map((f) => (
                  <li key={f} className="value-list-item">
                    <CheckCircle size={14} strokeWidth={2} className="value-check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-forest btn-sm value-cta" id="owner-cta">
                Owner / Manager Sign Up
              </Link>
            </div>

            {/* For Tenants */}
            <div className="value-card value-card-tenant" id="value-tenants">
              <div className="value-card-header">
                <div className="value-icon value-icon-tenant">
                  <Users size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="value-tag">For Tenants</div>
                  <h2 className="value-title">Know exactly where<br />you stand</h2>
                </div>
              </div>
              <p className="value-desc">
                View your rent history, download bills, and raise maintenance
                requests — without calling your landlord for every update.
              </p>
              <ul className="value-list">
                {TENANT_FEATURES.map((f) => (
                  <li key={f} className="value-list-item">
                    <CheckCircle size={14} strokeWidth={2} className="value-check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-secondary btn-sm value-cta" id="tenant-cta">
                Tenant Sign Up
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-how">
        <div className="landing-container">
          <h2 className="section-title">Simple to set up</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="step-num">1</div>
              <h3 className="step-title">Register your account</h3>
              <p className="step-desc">
                Sign up as an owner, property manager or tenant. Choose your role during registration.
              </p>
            </div>
            <div className="how-divider" aria-hidden="true" />
            <div className="how-step">
              <div className="step-num">2</div>
              <h3 className="step-title">Add your properties</h3>
              <p className="step-desc">
                Owners add properties and units, then invite tenants to their respective units.
              </p>
            </div>
            <div className="how-divider" aria-hidden="true" />
            <div className="how-step">
              <div className="step-num">3</div>
              <h3 className="step-title">Start managing</h3>
              <p className="step-desc">
                Record rent, generate bills, log expenses, and track requests from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-brand">
            <span className="landing-brand-dot" />
            <span className="landing-brand-name" style={{ color: 'var(--color-muted)' }}>
              RentSetu
            </span>
          </div>
          <p className="footer-note">
            A capstone project. All data is demo only.
          </p>
        </div>
      </footer>

    </div>
  );
}
