import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { loginUser } from '../../services/auth.js';
import { ROLE_HOME } from '../../data/users.js';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a brief async call
    setTimeout(() => {
      const result = loginUser(email, password);
      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      login(result.user, rememberMe);

      // Go to intended destination or role home
      const destination = from || ROLE_HOME[result.user.role] || '/dashboard';
      navigate(destination, { replace: true });
    }, 350);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">RentSetu</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">
            Enter your email and password below.
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="auth-demo-hint">
          <strong>Demo accounts:</strong><br />
          Owner: <code>suresh@sharmaproperties.in</code><br />
          Tenant: <code>rajesh.sharma@gmail.com</code><br />
          <span style={{ color: 'var(--color-muted)' }}>Any password works.</span>
        </div>

        <form onSubmit={handleSubmit} noValidate id="login-form">

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <Link to="/forgot-password" className="form-label-link" tabIndex={-1}>
                Forgot password?
              </Link>
            </div>
            <div className="form-input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
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
          </div>

          <div className="form-check auth-remember">
            <input
              id="login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <label htmlFor="login-remember">Remember me</label>
          </div>

          {error && (
            <div className="auth-error" role="alert" id="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full auth-submit-btn"
            id="login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register" id="login-to-register">Create one</Link>
        </p>

      </div>
    </div>
  );
}
