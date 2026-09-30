import React, { useState, useEffect } from 'react';
import { Flame, RefreshCw, AlertTriangle, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const HotspotsView = ({ userRole = 'OFFICER' }) => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/hotspots');
      setHotspots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load hotspots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiService.post('/hotspots/analyze?eps_km=1.5&min_samples=2');
      setSuccessMsg(res.message);
      fetchHotspots();
    } catch (err) {
      setErrorMsg(err.message || 'Hotspot analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="hotspots-view-container">
      <div className="section-card">
        <div className="sc-header justify-between">
          <div className="flex items-center gap-2">
            <Flame size={22} className="text-rose-400" />
            <h3>Geospatial Crime Hotspot Detection & Cluster Analytics</h3>
          </div>

          {(userRole === 'ADMIN' || userRole === 'OFFICER') && (
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="action-btn red"
            >
              <RefreshCw size={16} className={analyzing ? 'spinning' : ''} />
              <span>{analyzing ? 'Running Spatial Clustering...' : 'RUN HOTSPOT ANALYSIS'}</span>
            </button>
          )}
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        <p className="section-subtext">
          Identifies geographical high-concentration crime clusters using DBSCAN spatial density clustering on latitude/longitude records.
        </p>

        {loading ? (
          <div className="loading-state">Computing spatial crime density...</div>
        ) : (
          <div className="hotspots-grid">
            {hotspots.length === 0 ? (
              <div className="empty-state-box">
                No hotspots detected yet. Click "RUN HOTSPOT ANALYSIS" above to detect crime clusters.
              </div>
            ) : (
              hotspots.map(h => (
                <div key={h.id} className="hotspot-item-card">
                  <div className="hic-header">
                    <div className="hic-code">
                      <Flame size={18} className="text-rose-400" />
                      <span>{h.hotspot_code || `#H00${h.id}`}</span>
                    </div>
                    <span className={`risk-badge ${h.risk_level?.toLowerCase()}`}>
                      {h.risk_level} RISK
                    </span>
                  </div>

                  <div className="hic-body">
                    <h4 className="hic-area">{h.area_name}</h4>
                    <div className="hic-coords">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{h.latitude?.toFixed(4)}, {h.longitude?.toFixed(4)}</span>
                    </div>

                    <div className="hic-metrics-grid">
                      <div className="m-box">
                        <span className="lbl">Recorded Crimes</span>
                        <span className="val text-rose-400">{h.crime_count}</span>
                      </div>
                      <div className="m-box">
                        <span className="lbl">Dominant Crime</span>
                        <span className="val">{h.dominant_crime}</span>
                      </div>
                      <div className="m-box">
                        <span className="lbl">Cluster Radius</span>
                        <span className="val">{h.radius_km} km</span>
                      </div>
                      <div className="m-box">
                        <span className="lbl">Predicted Forecast</span>
                        <span className="val text-amber-400">{h.predicted_count || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hic-footer">
                    <span>Algorithm: {h.detection_method || 'DBSCAN / Spatial Density'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
