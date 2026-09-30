import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, Zap, Layers, Radar } from 'lucide-react';

export const HeroVisual = () => {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sampleIncidents = [
    { id: 1, type: 'Burglary', x: '35%', y: '42%', severity: 'high', label: 'CR-4092' },
    { id: 2, type: 'Vehicle Theft', x: '62%', y: '28%', severity: 'medium', label: 'CR-4105' },
    { id: 3, type: 'Cyber Fraud', x: '75%', y: '65%', severity: 'low', label: 'CR-4112' },
    { id: 4, type: 'Robbery Hotspot', x: '48%', y: '58%', severity: 'high', label: 'CR-4118' },
    { id: 5, type: 'Assault Warning', x: '22%', y: '70%', severity: 'high', label: 'CR-4124' },
  ];

  return (
    <div className="hero-visual-card">
      {/* Top Map Toolbar */}
      <div className="map-toolbar">
        <div className="map-title-badge">
          <Radar size={14} className="animate-spin-slow text-sky-400" />
          <span>GEOSPATIAL RADAR • NAGPUR METRO METRICS</span>
        </div>
        <div className="map-controls-group">
          <button 
            className={`map-tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            <Layers size={12} /> Heatmap
          </button>
          <button 
            className={`map-tab-btn ${activeTab === 'predictive' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictive')}
          >
            <Zap size={12} /> AI Risk Grid
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="map-viewport">
        {/* Simulated SVG City Grid Lines */}
        <svg className="city-grid-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="1" />
            </pattern>
            <radialGradient id="hotspot1" cx="48%" cy="58%" r="30%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)" />
              <stop offset="60%" stopColor="rgba(249, 115, 22, 0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="hotspot2" cx="35%" cy="42%" r="25%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Heatmap overlay gradients */}
          <rect width="100%" height="100%" fill="url(#hotspot1)" />
          <rect width="100%" height="100%" fill="url(#hotspot2)" />

          {/* Simulated Roads & GIS Corridors */}
          <path d="M 10 80 Q 200 150 400 120 T 600 250" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="2" strokeDasharray="4,4" />
          <path d="M 150 10 Q 180 200 320 380" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="3" />
          <circle cx="48%" cy="58%" r="45" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1.5" className="ping-circle" />
        </svg>

        {/* Radar Radar Sweep Overlay */}
        <div className="radar-sweep" />

        {/* Dynamic Incident Markers */}
        {sampleIncidents.map((inc) => (
          <div 
            key={inc.id}
            className={`map-marker-pin severity-${inc.severity}`}
            style={{ left: inc.x, top: inc.y }}
          >
            <div className="pin-head">
              <MapPin size={12} />
            </div>
            <div className="pin-popup">
              <div className="popup-label">{inc.label}</div>
              <div className="popup-type">{inc.type}</div>
            </div>
          </div>
        ))}

        {/* AI Predictive Intelligence Overlay Widget */}
        <div className="ai-overlay-widget">
          <div className="ai-widget-header">
            <Zap size={14} className="text-amber-400" />
            <span>AI Risk Prediction Engine</span>
            <span className="live-status-dot" />
          </div>
          <div className="ai-widget-body">
            <div className="risk-metric-row">
              <span className="metric-label">Predicted High-Risk Zone</span>
              <span className="metric-value text-rose-400 font-semibold">Zone 4 (East Corridor)</span>
            </div>
            <div className="risk-bar-container">
              <div className="risk-bar-fill" style={{ width: '84%' }} />
            </div>
            <div className="metric-footer">
              <span>Risk Probability Index: <strong style={{ color: '#ef4444' }}>84.2%</strong></span>
              <span>Model: <code style={{ color: '#38bdf8' }}>XGBoost v2.1</code></span>
            </div>
          </div>
        </div>

        {/* Real-time Stat Bar */}
        <div className="visual-stat-overlay">
          <div className="v-stat">
            <span className="v-stat-num text-sky-400">1,480+</span>
            <span className="v-stat-lbl">Incidents Mapped</span>
          </div>
          <div className="v-divider" />
          <div className="v-stat">
            <span className="v-stat-num text-rose-400">14</span>
            <span className="v-stat-lbl">Active Hotspots</span>
          </div>
          <div className="v-divider" />
          <div className="v-stat">
            <span className="v-stat-num text-emerald-400">96.4%</span>
            <span className="v-stat-lbl">Accuracy Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};
