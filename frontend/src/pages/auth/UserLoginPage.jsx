import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/authService';
import { User, ArrowLeft, Lock, Mail, KeyRound, AlertCircle, Shield } from 'lucide-react';

export const UserLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setUsername(DEMO_CREDENTIALS.USER.username);
    setPassword(DEMO_CREDENTIALS.USER.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login('USER', username, password);
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed for User portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-portal-wrapper user-theme">
      <div className="login-portal-card">
        {/* Navigation & Header */}
        <div className="portal-top-bar">
          <button className="back-btn" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            <span>Select Role</span>
          </button>
          <div className="portal-badge user">
            <User size={14} />
            <span>PUBLIC USER PORTAL</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="portal-header">
          <h1 className="portal-title">CrimeVista User Access</h1>
          <p className="portal-subtitle">
            Explore public crime information, trends and geographic insights.
          </p>
        </div>

        {/* Demo Credentials Quick Autofill Bar */}
        <div className="demo-helper-box user">
          <div className="dh-info">
            <Shield size={14} className="text-emerald-400" />
            <span>Demo Public Credentials</span>
          </div>
          <button type="button" onClick={handleFillDemo} className="dh-autofill-btn user">
            Auto-fill Demo User
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
            <label htmlFor="user-email">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="user-email"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="citizen.user@crimevista.org"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="user-password">Password</label>
            <div className="input-icon-wrap">
              <KeyRound size={18} className="input-icon" />
              <input
                id="user-password"
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

            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link will be sent to your registered email address."); }} className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-submit-btn user" disabled={loading}>
            {loading ? (
              <span>Authenticating User...</span>
            ) : (
              <>
                <Lock size={16} />
                <span>Login to User Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="portal-footer">
          <p>Target Destination: <code className="text-sky-400">/user/dashboard</code></p>
        </div>
      </div>
    </div>
  );
};
