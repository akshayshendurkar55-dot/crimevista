import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, User, ArrowLeft, ArrowRight, Lock, KeyRound } from 'lucide-react';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      roleKey: 'ADMIN',
      title: 'Admin',
      subtitle: 'System Administrator',
      icon: ShieldAlert,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.08)',
      borderHover: 'rgba(239, 68, 68, 0.5)',
      description: 'System administration and complete platform management.',
      route: '/login/admin',
      badge: 'Full Authority',
      capabilities: ['User & Role Management', 'System Configuration', 'ML Models & GIS Control', 'Audit Logs & Governance']
    },
    {
      id: 'officer',
      roleKey: 'OFFICER',
      title: 'Police Officer',
      subtitle: 'Law Enforcement Specialist',
      icon: ShieldCheck,
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.08)',
      borderHover: 'rgba(56, 189, 248, 0.5)',
      description: 'Crime management, geographic intelligence and operational analytics.',
      route: '/login/officer',
      badge: 'Operational Access',
      capabilities: ['FIR & Crime Data Upload', 'Hotspot & Heatmap Analytics', 'AI Risk Predictions', 'Case Incident Management']
    },
    {
      id: 'user',
      roleKey: 'USER',
      title: 'User',
      subtitle: 'Public Citizen Portal',
      icon: User,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.08)',
      borderHover: 'rgba(16, 185, 129, 0.5)',
      description: 'Explore public crime information, trends and geographic insights.',
      route: '/login/user',
      badge: 'Public Clearance',
      capabilities: ['Interactive Crime Map', 'Area Safety Index', 'Category Search & Filter', 'Public Safety Insights']
    }
  ];

  return (
    <div className="auth-page-wrapper">
      {/* Background Glow Effects */}
      <div className="auth-bg-radial" />

      {/* Top Header Navigation */}
      <header className="auth-header">
        <button className="back-link-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Back to Landing Page</span>
        </button>

        <div className="auth-brand" onClick={() => navigate('/')}>
          <Shield size={22} className="text-sky-400" />
          <span>CRIMEVISTA</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="role-selection-container">
        <div className="role-selection-header">
          <div className="auth-pill">ROLE-BASED AUTHENTICATION</div>
          <h1 className="role-selection-title">Login to CrimeVista</h1>
          <p className="role-selection-subtitle">
            Select your authorized portal to access role-tailored intelligence tools, analytics, and security controls.
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="role-cards-grid">
          {roles.map((r) => {
            const IconComponent = r.icon;
            return (
              <div 
                key={r.id}
                className="role-card"
                onClick={() => navigate(r.route)}
                style={{ '--role-color': r.color, '--role-bg': r.bgGlow }}
              >
                <div className="role-card-top">
                  <div className="role-icon-wrapper">
                    <IconComponent size={28} style={{ color: r.color }} />
                  </div>
                  <span className="role-card-badge" style={{ borderColor: r.color, color: r.color }}>
                    {r.badge}
                  </span>
                </div>

                <h2 className="role-card-title">{r.title}</h2>
                <div className="role-card-subtitle">{r.subtitle}</div>
                <p className="role-card-desc">{r.description}</p>

                <div className="role-capabilities-list">
                  {r.capabilities.map((cap, i) => (
                    <div key={i} className="capability-item">
                      <span className="cap-dot" style={{ backgroundColor: r.color }} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                <div className="role-card-footer">
                  <button className="role-login-btn">
                    <span>Login as {r.title}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Security Note */}
        <div className="auth-security-notice">
          <Lock size={14} className="text-sky-400" />
          <span>
            Strict Role-Based Access Control (RBAC) enforced. Unauthorized access attempts are monitored and logged.
          </span>
        </div>
      </main>
    </div>
  );
};
