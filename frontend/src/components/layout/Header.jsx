import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogIn, ChevronRight, Activity } from 'lucide-react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + anchorId);
      return;
    }
    const element = document.querySelector(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="crimevista-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="header-brand" onClick={() => navigate('/')}>
          <div className="logo-badge">
            <Shield size={20} className="logo-icon" />
            <span className="logo-pulse" />
          </div>
          <div className="brand-text">
            <span className="brand-name">CRIMEVISTA</span>
            <span className="brand-tag">GEOSPATIAL INTELLIGENCE</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button onClick={() => handleNavClick('#home')} className="nav-link">Home</button>
          <button onClick={() => handleNavClick('#features')} className="nav-link">Features</button>
          <button onClick={() => handleNavClick('#how-it-works')} className="nav-link">How It Works</button>
          <button onClick={() => handleNavClick('#analytics')} className="nav-link">Analytics</button>
          <button onClick={() => handleNavClick('#about')} className="nav-link">About</button>
          <button onClick={() => handleNavClick('#contact')} className="nav-link">Contact</button>
        </nav>

        {/* Action Button */}
        <div className="header-actions">
          <button 
            className="login-trigger-btn"
            onClick={() => navigate('/login')}
          >
            <LogIn size={16} />
            <span>Login Portal</span>
            <ChevronRight size={14} className="arrow-icon" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-hamburger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav">
            <button onClick={() => handleNavClick('#home')} className="mobile-nav-link">Home</button>
            <button onClick={() => handleNavClick('#features')} className="mobile-nav-link">Features</button>
            <button onClick={() => handleNavClick('#how-it-works')} className="mobile-nav-link">How It Works</button>
            <button onClick={() => handleNavClick('#analytics')} className="mobile-nav-link">Analytics</button>
            <button onClick={() => handleNavClick('#about')} className="mobile-nav-link">About</button>
            <button onClick={() => handleNavClick('#contact')} className="mobile-nav-link">Contact</button>
            
            <div className="mobile-login-box">
              <button 
                className="mobile-login-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                <LogIn size={18} />
                <span>Access CrimeVista Login</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
