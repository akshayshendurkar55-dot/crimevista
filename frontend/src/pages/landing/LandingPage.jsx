import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { HeroVisual } from '../../components/landing/HeroVisual';
import { WorkflowSection } from '../../components/landing/WorkflowSection';
import { 
  BarChart3, 
  Map, 
  BrainCircuit, 
  Compass, 
  LayoutDashboard, 
  ShieldCheck, 
  ArrowRight,
  Shield,
  Activity,
  Cpu,
  LineChart,
  FileCheck,
  ChevronRight,
  Lock,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Crime Analytics",
      description: "Analyze historical crime data and identify important patterns and trends across time frames and crime categories.",
      tag: "Data Insights"
    },
    {
      icon: Map,
      title: "Geospatial Intelligence",
      description: "Visualize crime locations, hotspots and geographic patterns with high-density spatial heatmaps and corridor analysis.",
      tag: "GIS Mapping"
    },
    {
      icon: BrainCircuit,
      title: "AI Crime Prediction",
      description: "Analyze historical data and generate crime-risk insights using machine learning predictive algorithms.",
      tag: "Predictive Analytics"
    },
    {
      icon: Compass,
      title: "Interactive Crime Map",
      description: "Explore crime incidents through an interactive geographic map with category filtering, date ranges, and area overlays.",
      tag: "Real-Time Visualizer"
    },
    {
      icon: LayoutDashboard,
      title: "Smart Dashboard",
      description: "Provide different analytics, operational tools, and system controls tailored to specific user roles.",
      tag: "Role-Tailored"
    },
    {
      icon: ShieldCheck,
      title: "Secure Access",
      description: "Use strict role-based authentication and authorization for System Admins, Police Officers, and Public Citizens.",
      tag: "RBAC Security"
    }
  ];

  return (
    <div className="crimevista-landing">
      {/* Top Header */}
      <Header />

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-grid">
          {/* Left Text Column */}
          <div className="hero-text-col">
            <div className="hero-badge">
              <Shield size={14} className="text-sky-400" />
              <span>NEXT-GEN GEOSPATIAL INTELLIGENCE</span>
            </div>

            <h1 className="hero-main-title">
              Crime<span className="text-gradient">Vista</span>
            </h1>

            <p className="hero-subheading">
              AI-Powered Geospatial Crime Intelligence & Predictive Platform
            </p>

            <p className="hero-description">
              Transforming crime data into actionable intelligence through artificial intelligence, geospatial analytics, interactive visualization and predictive insights.
            </p>

            <div className="hero-cta-group">
              <button 
                className="btn-primary-glow"
                onClick={() => {
                  const elem = document.querySelector('#features');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore CrimeVista</span>
                <ChevronRight size={18} />
              </button>

              <button 
                className="btn-secondary-outline"
                onClick={() => navigate('/login')}
              >
                <Lock size={16} />
                <span>Portal Login</span>
              </button>
            </div>

            {/* Quick Stat Highlights */}
            <div className="hero-quick-stats">
              <div className="qs-item">
                <span className="qs-val">3 Roles</span>
                <span className="qs-lbl">Admin • Officer • Citizen</span>
              </div>
              <div className="qs-divider" />
              <div className="qs-item">
                <span className="qs-val">GIS Ready</span>
                <span className="qs-lbl">PostGIS & Leaflet Engine</span>
              </div>
              <div className="qs-divider" />
              <div className="qs-item">
                <span className="qs-val">AI Models</span>
                <span className="qs-lbl">XGBoost Risk Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Visual Map Column */}
          <div className="hero-visual-col">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-pill">CORE CAPABILITIES</div>
          <h2 className="section-title">Built for Data-Driven Law Enforcement</h2>
          <p className="section-subtitle">
            Engineered to bridge geospatial GIS mapping with advanced machine learning predictive algorithms.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feat-header">
                  <div className="feat-icon-box">
                    <IconComp size={24} className="feat-icon" />
                  </div>
                  <span className="feat-badge">{feat.tag}</span>
                </div>
                <h3 className="feat-title">{feat.title}</h3>
                <p className="feat-desc">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Pipeline */}
      <WorkflowSection />

      {/* About CrimeVista Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-grid">
            <div className="about-text-content">
              <div className="section-pill">PLATFORM ARCHITECTURE</div>
              <h2 className="about-heading">Transforming Law Enforcement & Public Safety</h2>
              <p className="about-paragraph">
                CrimeVista is designed to help analyze crime data using modern data science techniques including Artificial Intelligence, Machine Learning, GIS (Geographic Information Systems), Geospatial Analytics, Data Visualization, and Predictive Analytics.
              </p>
              <p className="about-paragraph">
                By synthesizing historical FIR records, spatial incident coordinates, and time-series patterns, CrimeVista enables police authorities to proactively allocate patrol resources, identify emerging crime corridors, and empower citizens with accurate area safety awareness.
              </p>

              <div className="about-tech-badges">
                <div className="tech-chip"><Cpu size={14} /> Artificial Intelligence</div>
                <div className="tech-chip"><BrainCircuit size={14} /> Machine Learning</div>
                <div className="tech-chip"><Map size={14} /> GIS Mapping</div>
                <div className="tech-chip"><LineChart size={14} /> Geospatial Analytics</div>
                <div className="tech-chip"><FileCheck size={14} /> Data Cleaning</div>
                <div className="tech-chip"><ShieldCheck size={14} /> RBAC Security</div>
              </div>
            </div>

            <div className="about-metrics-card">
              <div className="am-header">
                <Shield size={20} className="text-sky-400" />
                <span>CrimeVista Core Objectives</span>
              </div>
              <div className="am-list">
                <div className="am-item">
                  <div className="am-bullet" />
                  <div>
                    <strong>Proactive Hotspot Detection</strong>
                    <p>Detect geographic micro-clusters before repeat offenses escalate.</p>
                  </div>
                </div>
                <div className="am-item">
                  <div className="am-bullet" />
                  <div>
                    <strong>Role-Based Operational Security</strong>
                    <p>Enforce strict RBAC data boundaries between police operations and citizen tools.</p>
                  </div>
                </div>
                <div className="am-item">
                  <div className="am-bullet" />
                  <div>
                    <strong>Scalable FastAPI & Spatial Database Architecture</strong>
                    <p>Built for seamless integration with PostgreSQL, PostGIS, and Scikit-Learn ML models.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics CTA Section */}
      <section id="analytics" className="cta-banner-section">
        <div className="cta-banner-content">
          <h2 className="cta-title">Ready to Access CrimeVista Portal?</h2>
          <p className="cta-desc">
            Select your role to access system administration, officer intelligence controls, or public crime insights.
          </p>
          <button 
            className="btn-primary-glow large"
            onClick={() => navigate('/login')}
          >
            <span>Proceed to Login Portal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="crimevista-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <Shield size={22} className="text-sky-400" />
              <span>CRIMEVISTA</span>
            </div>
            <p className="footer-tagline">
              AI-Powered Geospatial Crime Intelligence & Predictive Platform.
            </p>
            <p className="footer-subtext">
              Final-Year BTech Computer Science & Engineering Project.
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#about">About Platform</a></li>
              <li><button onClick={() => navigate('/login')}>Login Portals</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Role Portals</h4>
            <ul>
              <li><button onClick={() => navigate('/login/admin')}>Admin Login</button></li>
              <li><button onClick={() => navigate('/login/officer')}>Police Officer Login</button></li>
              <li><button onClick={() => navigate('/login/user')}>User Login</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Platform Details</h4>
            <div className="contact-item">
              <MapPin size={14} className="text-sky-400" />
              <span>Nagpur, Maharashtra, India</span>
            </div>
            <div className="contact-item">
              <Mail size={14} className="text-sky-400" />
              <span>support@crimevista.gov.in</span>
            </div>
            <div className="contact-item">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>RBAC Protected System</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CrimeVista Platform. All rights reserved. Built for BTech CSE Project Demonstration.</p>
        </div>
      </footer>
    </div>
  );
};
