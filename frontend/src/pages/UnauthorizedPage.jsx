import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();

  const attemptedPath = location.state?.attemptedPath || 'Restricted Area';
  const currentRole = role || 'GUEST';

  const getTargetDashboard = () => {
    switch (currentRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'OFFICER':
        return '/officer/dashboard';
      case 'USER':
        return '/user/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090d16',
      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#0f172a',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 1.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444'
        }}>
          <ShieldAlert size={36} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#fca5a5',
          fontSize: '0.8rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          borderRadius: '20px',
          marginBottom: '1rem'
        }}>
          <Lock size={12} /> Access Denied 403
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: '#ffffff' }}>
          Authorization Security Restriction
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Your current account role <span style={{ color: '#38bdf8', fontWeight: '600' }}>[{currentRole}]</span> does not possess clearance for the path <code style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', color: '#f43f5e' }}>{attemptedPath}</code>.
        </p>

        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '1rem',
          fontSize: '0.85rem',
          color: '#cbd5e1',
          textAlign: 'left',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyBetween: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b' }}>Security Clearance:</span>
            <span style={{ fontWeight: '600', color: '#38bdf8' }}>Role-Based Access Enforced</span>
          </div>
          <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Account:</span>
            <span style={{ fontWeight: '500' }}>{user?.username || 'Authenticated User'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(getTargetDashboard())}
            style={{
              flex: '1',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
          >
            <Home size={16} /> Return to My Dashboard
          </button>
          
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#64748b'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
          >
            <ArrowLeft size={16} /> Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
