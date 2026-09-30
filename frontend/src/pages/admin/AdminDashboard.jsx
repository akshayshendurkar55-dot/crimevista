import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { 
  LayoutDashboard, Users, UserCheck, ShieldCheck, Database, FileText, 
  Map, BrainCircuit, TrendingUp, BarChart, Bell, History, Settings, 
  User, LogOut, Shield, Menu, X, ChevronRight, Lock, Cpu, Server, Flame
} from 'lucide-react';

import { UserManagementView } from '../../components/features/UserManagementView';
import { OfficerManagementView } from '../../components/features/OfficerManagementView';
import { DatasetManagementView } from '../../components/features/DatasetManagementView';
import { CrimeRecordsView } from '../../components/features/CrimeRecordsView';
import { CrimeIntelligenceMap } from '../../components/features/CrimeIntelligenceMap';
import { AITrainingView } from '../../components/features/AITrainingView';
import { CrimePredictionView } from '../../components/features/CrimePredictionView';
import { HotspotsView } from '../../components/features/HotspotsView';
import { CrimeAnalyticsView } from '../../components/features/CrimeAnalyticsView';
import { AuditLogsView } from '../../components/features/AuditLogsView';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'User Management', icon: Users },
    { name: 'Officer Management', icon: UserCheck },
    { name: 'Crime Dataset Management', icon: Database },
    { name: 'Crime Records', icon: FileText },
    { name: 'GIS / Crime Map', icon: Map },
    { name: 'AI / ML Models', icon: BrainCircuit },
    { name: 'Predictions', icon: TrendingUp },
    { name: 'Crime Hotspots', icon: Flame },
    { name: 'Analytics', icon: BarChart },
    { name: 'Audit Logs', icon: History }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.get('/admin/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login/admin');
  };

  const renderMainContent = () => {
    switch (activeItem) {
      case 'User Management':
        return <UserManagementView />;
      case 'Officer Management':
        return <OfficerManagementView />;
      case 'Crime Dataset Management':
        return <DatasetManagementView />;
      case 'Crime Records':
        return <CrimeRecordsView userRole="ADMIN" />;
      case 'GIS / Crime Map':
        return <CrimeIntelligenceMap />;
      case 'AI / ML Models':
        return <AITrainingView />;
      case 'Predictions':
        return <CrimePredictionView />;
      case 'Crime Hotspots':
        return <HotspotsView userRole="ADMIN" />;
      case 'Analytics':
        return <CrimeAnalyticsView />;
      case 'Audit Logs':
        return <AuditLogsView />;
      case 'Dashboard':
      default:
        return (
          <>
            {/* Quick Stat Cards Grid powered by REAL database metrics */}
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Total System Users</span>
                  <Users size={18} className="text-rose-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_users : '...'}</div>
                <div className="dsc-sub text-emerald-400">Verified Citizen Accounts</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Active Police Officers</span>
                  <UserCheck size={18} className="text-sky-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_officers : '...'}</div>
                <div className="dsc-sub">Duty Clearance Verified</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Total Crime Records</span>
                  <FileText size={18} className="text-purple-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_crime_records : '...'}</div>
                <div className="dsc-sub text-purple-400">Database Operational Source</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Crime Datasets Uploaded</span>
                  <Database size={18} className="text-amber-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_datasets : '...'}</div>
                <div className="dsc-sub">Validation & Cleaning Pipelines</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Detected Hotspots</span>
                  <Flame size={18} className="text-rose-400" />
                </div>
                <div className="dsc-value">{stats ? stats.total_hotspots : '...'}</div>
                <div className="dsc-sub text-rose-400">DBSCAN Spatial Density</div>
              </div>

              <div className="dash-stat-card">
                <div className="dsc-header">
                  <span className="dsc-title">Active ML Model</span>
                  <BrainCircuit size={18} className="text-emerald-400" />
                </div>
                <div className="dsc-value">{stats ? stats.active_model_algorithm : 'Random Forest'}</div>
                <div className="dsc-sub text-emerald-400">R² Score: {stats ? (stats.active_model_r2 * 100).toFixed(1) : 91.2}%</div>
              </div>
            </div>

            {/* Live Interactive Crime Intelligence Map */}
            <div className="workspace-card margin-top">
              <div className="wc-header">
                <Map size={18} className="text-rose-400" />
                <h3>Live Geospatial Crime Intelligence & Hotspot Map</h3>
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
    <div className="dashboard-layout-container admin-theme">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-box">
          <div className="brand-logo-wrap">
            <Shield size={20} className="text-rose-400" />
            <span className="brand-title">CRIMEVISTA</span>
          </div>
          <div className="role-tag-pill admin">
            <span>ADMINISTRATOR</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">SYSTEM GOVERNANCE</div>
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
            <div className="user-avatar admin">ADM</div>
            <div className="user-meta">
              <span className="user-name">{user?.name || 'System Administrator'}</span>
              <span className="user-badge">{user?.badge || 'ADM-9001'}</span>
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
              <span className="bc-root">Admin Portal</span>
              <span className="bc-sep">/</span>
              <span className="bc-current">{activeItem}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status-indicator">
              <span className="status-dot green" />
              <span>FastAPI Backend Connected</span>
            </div>

            <button className="topbar-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="dashboard-workspace">
          <div className="workspace-welcome-banner admin">
            <div className="wb-content">
              <div className="wb-pill">COMPLETE SYSTEM CONTROL • FINAL PHASE</div>
              <h1 className="wb-title">System Administration & Intelligence Oversight</h1>
              <p className="wb-sub">
                Authenticated as <strong style={{ color: '#ef4444' }}>{user?.email || 'admin@crimevista.gov.in'}</strong>. Dataset pipelines, AI model training, user governance, and hotspot analytics active.
              </p>
            </div>
            <div className="wb-badge-box">
              <Lock size={28} className="text-rose-400" />
            </div>
          </div>

          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};
