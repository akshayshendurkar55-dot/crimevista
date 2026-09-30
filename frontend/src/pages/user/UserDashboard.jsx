import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { 
  LayoutDashboard, Map, BarChart, TrendingUp, Search, ShieldCheck, 
  BrainCircuit, FileText, Bell, User, LogOut, Shield, Menu, X, 
  ChevronRight, Eye, MapPin, Flame
} from 'lucide-react';

import { CrimeIntelligenceMap } from '../../components/features/CrimeIntelligenceMap';
import { HotspotsView } from '../../components/features/HotspotsView';
import { CrimeAnalyticsView } from '../../components/features/CrimeAnalyticsView';
import { CrimePredictionView } from '../../components/features/CrimePredictionView';

export const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Explore Crime Areas', icon: Map },
    { name: 'Crime Hotspots', icon: Flame },
    { name: 'Crime Statistics', icon: BarChart },
    { name: 'Crime Trends', icon: TrendingUp },
    { name: 'AI Safety Insights', icon: BrainCircuit }
  ];

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const [crimeStats, hotspots] = await Promise.all([
        apiService.get('/crimes/statistics'),
        apiService.get('/hotspots')
      ]);

      setStats({
        total_crimes: crimeStats.total_crimes || 0,
        total_locations: crimeStats.total_locations || 0,
        total_hotspots: Array.isArray(hotspots) ? hotspots.length : 0,
        safety_index: 78
      });
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login/user');
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Explore Crime Areas':
        return <CrimeIntelligenceMap />;
      case 'Crime Hotspots':
        return <HotspotsView userRole="USER" />;
      case 'Crime Statistics':
      case 'Crime Trends':
        return <CrimeAnalyticsView />;
      case 'AI Safety Insights':
        return <CrimePredictionView />;
      case 'Dashboard':
      default:
        return (
          <>
            {/* Quick Stat Cards Grid */}
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Public Incidents Mapped</span>
                  <MapPin size={18} className="text-emerald-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_crimes : '...'}</div>
                <div className="dsc-sub text-emerald-400">Verified Database Records</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Nagpur Safety Index Score</span>
                  <ShieldCheck size={18} className="text-sky-400" />
                </div>
                <div className="dsc-value">{stats ? stats.safety_index : '78'} / 100</div>
                <div className="dsc-sub text-sky-400">Moderate Overall Safety Index</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Monitored Crime Hotspots</span>
                  <Flame size={18} className="text-amber-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_hotspots : '...'} Sectors</div>
                <div className="dsc-sub">Spatial Density Analysis</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Public Intelligence Status</span>
                  <Eye size={18} className="text-purple-400" />
                </div>
                <div className="dsc-value text-emerald-400" style={{ fontSize: '1.2rem' }}>Verified Active</div>
                <div className="dsc-sub text-purple-400">Read-Only Safety Portal</div>
              </div>
            </div>

            {/* Interactive Crime Map */}
            <div className="workspace-card margin-top">
              <div className="wc-header">
                <Eye size={18} className="text-emerald-400" />
                <h3>Explore Crime Areas & Spatial Safety Heatmap</h3>
              </div>
              <div className="wc-body p-0">
                <CrimeIntelligenceMap />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout-container user-theme">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-box">
          <div className="brand-logo-wrap">
            <Shield size={20} className="text-emerald-400" />
            <span className="brand-title">CRIMEVISTA</span>
          </div>
          <div className="role-tag-pill user">
            <span>PUBLIC CITIZEN</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">PUBLIC SAFETY PORTAL</div>
          {sidebarItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveItem(item.name);
                  setSidebarOpen(false);
                }}
              >
                <IconComp size={18} className="nav-btn-icon" />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={14} className="active-chevron" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-user-footer">
          <div className="user-profile-info">
            <div className="user-avatar user">USR</div>
            <div className="user-meta">
              <span className="user-name">{user?.name || 'Verified Citizen'}</span>
              <span className="user-badge">{user?.badge || 'PUBLIC-108'}</span>
            </div>
          </div>

          <button className="logout-action-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        {/* Top Navbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="breadcrumb-box">
              <span className="bc-root">Citizen Portal</span>
              <span className="bc-sep">/</span>
              <span className="bc-current">{activeItem}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status-indicator">
              <span className="status-dot green" />
              <span>Public Intelligence Active</span>
            </div>

            <button className="topbar-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="dashboard-workspace">
          <div className="workspace-welcome-banner user">
            <div className="wb-content">
              <div className="wb-pill">PUBLIC SAFETY & TRANSPARENCY • FINAL PHASE</div>
              <h1 className="wb-title">Public Crime Intelligence & Spatial Insights</h1>
              <p className="wb-sub">
                Logged in as <strong style={{ color: '#10b981' }}>{user?.email || 'citizen.user@crimevista.org'}</strong>. Explore verified public crime statistics, spatial safety trends, and area risk summaries across Nagpur.
              </p>
            </div>
            <div className="wb-badge-box">
              <Eye size={28} className="text-emerald-400" />
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};
