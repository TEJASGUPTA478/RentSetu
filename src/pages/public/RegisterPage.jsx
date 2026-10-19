import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './AuthPages.css';

const ROLES = [
  { value: 'owner',   label: 'Property Owner' },
  { value: 'manager', label: 'Property Manager' },
  { value: 'tenant',  label: 'Tenant' },
];

function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Full name is required.';
  if (!fields.email.trim()) errors.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.';
  if (!fields.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!/^[6-9]\d{9}$/.test(fields.phone.replace(/\s+/g, '')))
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (!fields.password) errors.password = 'Password is required.';
  else if (fields.password.length < 6)
    errors.password = 'Password must be at least 6 characters.';
  if (!fields.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (fields.password !== fields.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';
  if (!fields.role) errors.role = 'Please select a role.';
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">RentSetu</span>
          </div>
          <div className="auth-success-state">
            <div className="auth-success-icon">✓</div>
            <h2 className="auth-success-title">Account created</h2>
            <p className="auth-success-msg">
              In the live application, you would receive a verification email.
              For now, you can sign in with one of the demo accounts.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-register">

        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">RentSetu</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Join RentSetu to manage your properties or view your tenancy.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate id="register-form">

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Suresh Sharma"
              value={fields.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={fields.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone number</label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="9876543210"
              value={fields.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="form-input-wrap">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 6 characters"
                value={fields.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="form-input-icon"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
            <div className="form-input-wrap">
              <input
                id="reg-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password"
                value={fields.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="form-input-icon"
                onClick={() => setShowConfirm(s => !s)}
                aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">I am a</label>
            <select
              id="reg-role"
              name="role"
              className={`form-select ${errors.role ? 'input-error' : ''}`}
              value={fields.role}
              onChange={handleChange}
            >
              <option value="">— Select your role —</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.role && <span className="form-error">{errors.role}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full auth-submit-btn"
            id="register-submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" id="register-to-login">Sign in</Link>
        </p>

      </div>
    </div>
  );
}
