import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/authService';
import { ShieldCheck, ArrowLeft, Lock, Mail, KeyRound, AlertCircle, Shield } from 'lucide-react';

export const OfficerLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setUsername(DEMO_CREDENTIALS.OFFICER.username);
    setPassword(DEMO_CREDENTIALS.OFFICER.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login('OFFICER', username, password);
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed for Officer portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-portal-wrapper officer-theme">
      <div className="login-portal-card">
        {/* Navigation & Header */}
        <div className="portal-top-bar">
          <button className="back-btn" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            <span>Select Role</span>
          </button>
          <div className="portal-badge officer">
            <ShieldCheck size={14} />
            <span>POLICE OFFICER PORTAL</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="portal-header">
          <h1 className="portal-title">Police Officer Secure Access</h1>
          <p className="portal-subtitle">
            Crime management, geographic intelligence and operational analytics.
          </p>
        </div>

        {/* Demo Credentials Quick Autofill Bar */}
        <div className="demo-helper-box officer">
          <div className="dh-info">
            <Shield size={14} className="text-sky-400" />
            <span>Demo Officer Credentials</span>
          </div>
          <button type="button" onClick={handleFillDemo} className="dh-autofill-btn officer">
            Auto-fill Demo Officer
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
            <label htmlFor="officer-id">Officer ID / Email</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="officer-id"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="officer.sharma@police.gov.in"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="officer-password">Password</label>
            <div className="input-icon-wrap">
              <KeyRound size={18} className="input-icon" />
              <input
                id="officer-password"
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

            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Police Officer credential reset request sent to Station IT Administrator."); }} className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-submit-btn officer" disabled={loading}>
            {loading ? (
              <span>Authenticating Officer...</span>
            ) : (
              <>
                <Lock size={16} />
                <span>Login to Officer Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="portal-footer">
          <p>Target Destination: <code className="text-sky-400">/officer/dashboard</code></p>
        </div>
      </div>
    </div>
  );
};
