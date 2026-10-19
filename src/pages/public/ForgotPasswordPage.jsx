import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">RentSetu</span>
        </div>

        {submitted ? (
          <div className="auth-success-state">
            <div className="auth-success-icon">✓</div>
            <h2 className="auth-success-title">Check your email</h2>
            <p className="auth-success-msg">
              If an account with <strong>{email}</strong> exists, a password
              reset link has been sent. (This is a demo — no email is actually sent.)
            </p>
            <Link to="/login" className="btn btn-primary btn-full">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Reset your password</h1>
              <p className="auth-subtitle">
                Enter the email address on your account and we'll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate id="forgot-form">
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
                {error && <span className="form-error">{error}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full auth-submit-btn"
                id="forgot-submit"
              >
                Send Reset Link
              </button>
            </form>

            <p className="auth-footer-text">
              Remembered it?{' '}
              <Link to="/login" id="forgot-to-login">Back to Sign In</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
