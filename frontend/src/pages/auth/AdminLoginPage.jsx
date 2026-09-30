import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/authService';
import { ShieldAlert, ArrowLeft, Lock, Mail, KeyRound, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setUsername(DEMO_CREDENTIALS.ADMIN.username);
    setPassword(DEMO_CREDENTIALS.ADMIN.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login('ADMIN', username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed for Admin portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-portal-wrapper admin-theme">
      <div className="login-portal-card">
        {/* Navigation & Header */}
        <div className="portal-top-bar">
          <button className="back-btn" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            <span>Select Role</span>
          </button>
          <div className="portal-badge admin">
            <ShieldAlert size={14} />
            <span>SECURE ADMIN PORTAL</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="portal-header">
          <h1 className="portal-title">Secure Admin Access</h1>
          <p className="portal-subtitle">
            System administration, dataset management, and security governance.
          </p>
        </div>

        {/* Demo Credentials Quick Autofill Bar */}
        <div className="demo-helper-box admin">
          <div className="dh-info">
            <Shield size={14} className="text-rose-400" />
            <span>Demo Admin Credentials</span>
          </div>
          <button type="button" onClick={handleFillDemo} className="dh-autofill-btn admin">
            Auto-fill Demo Admin
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="portal-form">
          <div className="form-group">
            <label htmlFor="admin-id">Admin ID / Email</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="admin-id"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@crimevista.gov.in"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-icon-wrap">
              <KeyRound size={18} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="form-row-between">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>

            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Admin password resets require security token verification from master administrator."); }} className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-submit-btn admin" disabled={loading}>
            {loading ? (
              <span>Authenticating Admin...</span>
            ) : (
              <>
                <Lock size={16} />
                <span>Login to Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="portal-footer">
          <p>Target Destination: <code className="text-sky-400">/admin/dashboard</code></p>
        </div>
      </div>
    </div>
  );
};
