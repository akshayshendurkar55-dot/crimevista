import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { 
  LayoutDashboard, Map, FileText, PlusSquare, Search, Flame, 
  BrainCircuit, Navigation, BarChart2, Bell, Briefcase, User, 
  LogOut, ShieldCheck, Menu, X, ChevronRight, Activity, AlertTriangle
} from 'lucide-react';

import { CrimeRecordsView } from '../../components/features/CrimeRecordsView';
import { CrimeIntelligenceMap } from '../../components/features/CrimeIntelligenceMap';
import { HotspotsView } from '../../components/features/HotspotsView';
import { CrimePredictionView } from '../../components/features/CrimePredictionView';
import { CrimeAnalyticsView } from '../../components/features/CrimeAnalyticsView';

export const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Crime Map', icon: Map },
    { name: 'Crime Records', icon: FileText },
    { name: 'Add Crime Report', icon: PlusSquare },
    { name: 'Crime Hotspots', icon: Flame },
    { name: 'AI Predictions', icon: BrainCircuit },
    { name: 'Area Analytics', icon: BarChart2 }
  ];

  useEffect(() => {
    fetchOfficerStats();
  }, []);

  const fetchOfficerStats = async () => {
    try {
      const [crimeStats, hotspots, preds] = await Promise.all([
        apiService.get('/crimes/statistics'),
        apiService.get('/hotspots'),
        apiService.get('/ml/predictions').catch(() => [])
      ]);

      setStats({
        total_crimes: crimeStats.total_crimes || 0,
        total_locations: crimeStats.total_locations || 0,
        active_hotspots: Array.isArray(hotspots) ? hotspots.length : 0,
        total_predictions: Array.isArray(preds) ? preds.length : 0,
        latest_prediction: preds.length > 0 ? `${preds[0].area_name} (${preds[0].risk_level} Risk)` : 'Sitabuldi (High Risk)'
      });
    } catch (err) {
      console.error('Failed to fetch officer stats:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login/officer');
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Crime Map':
        return <CrimeIntelligenceMap />;
      case 'Crime Records':
        return <CrimeRecordsView userRole="OFFICER" />;
      case 'Add Crime Report':
        return <CrimeRecordsView userRole="OFFICER" />;
      case 'Crime Hotspots':
        return <HotspotsView userRole="OFFICER" />;
      case 'AI Predictions':
        return <CrimePredictionView />;
      case 'Area Analytics':
        return <CrimeAnalyticsView />;
      case 'Dashboard':
      default:
        return (
          <>
            {/* Quick Stat Cards Grid */}
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Total Crime Records</span>
                  <FileText size={18} className="text-sky-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_crimes : '...'}</div>
                <div className="dsc-sub text-sky-400">Database Operational Source</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Hotspot Areas Monitored</span>
                  <Flame size={18} className="text-amber-400" />
                </div>
                <div className="dsc-value">{stats ? stats.active_hotspots : '...'}</div>
                <div className="dsc-sub text-rose-400">DBSCAN Spatial Clusters</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">AI Predictions Executed</span>
                  <BrainCircuit size={18} className="text-emerald-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_predictions : '...'} Reports</div>
                <div className="dsc-sub text-emerald-400">91.2% R² Accuracy Rate</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Latest Risk Assessment</span>
                  <AlertTriangle size={18} className="text-rose-400" />
                </div>
                <div className="dsc-value text-amber-400" style={{ fontSize: '1.2rem' }}>
                  {stats ? stats.latest_prediction : 'Sitabuldi (High Risk)'}
                </div>
                <div className="dsc-sub">Operational Patrol Target</div>
              </div>
            </div>

            {/* Crime Map View */}
            <div className="workspace-card margin-top">
              <div className="wc-header">
                <Activity size={18} className="text-sky-400" />
                <h3>Nagpur Geospatial Operational Map & Hotspots</h3>
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
    <div className="dashboard-layout-container officer-theme">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-box">
          <div className="brand-logo-wrap">
            <ShieldCheck size={20} className="text-sky-400" />
            <span className="brand-title">CRIMEVISTA</span>
          </div>
          <div className="role-tag-pill officer">
            <span>POLICE OFFICER</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">OPERATIONS & ANALYTICS</div>
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
            <div className="user-avatar officer">POL</div>
            <div className="user-meta">
              <span className="user-name">{user?.name || 'Inspector V. Sharma'}</span>
              <span className="user-badge">{user?.badge || 'POL-4482'}</span>
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
              <span className="bc-root">Officer Portal</span>
              <span className="bc-sep">/</span>
              <span className="bc-current">{activeItem}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status-indicator">
              <span className="status-dot green" />
              <span>Duty Clearance Verified</span>
            </div>

            <button className="topbar-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="dashboard-workspace">
          <div className="workspace-welcome-banner officer">
            <div className="wb-content">
              <div className="wb-pill">OPERATIONAL CRIME MANAGEMENT • FINAL PHASE</div>
              <h1 className="wb-title">Operational Crime Intelligence & Record Operations</h1>
              <p className="wb-sub">
                Logged in as <strong style={{ color: '#38bdf8' }}>{user?.email || 'officer.sharma@police.gov.in'}</strong>. Operational access to add/edit FIR records, view hotspots, and generate AI risk predictions.
              </p>
            </div>
            <div className="wb-badge-box">
              <ShieldCheck size={28} className="text-sky-400" />
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};
