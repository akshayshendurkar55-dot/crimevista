import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Flame, MapPin, AlertTriangle, Shield, Search, Filter, Layers, Navigation } from 'lucide-react';
import { apiService } from '../../services/apiService';

// Fix Leaflet marker icons in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for Map Layers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const crimeIcon = createCustomIcon('#3b82f6'); // Blue for historical crimes
const hotspotIcon = createCustomIcon('#ef4444'); // Red for hotspots
const predictedIcon = createCustomIcon('#f59e0b'); // Amber for predictions

export const CrimeIntelligenceMap = () => {
  const [crimes, setCrimes] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchArea, setSearchArea] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Layer Visibility Controls
  const [showCrimes, setShowCrimes] = useState(true);
  const [showDensity, setShowDensity] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [crimeData, hotspotData, predData] = await Promise.all([
        apiService.get('/crimes'),
        apiService.get('/hotspots'),
        apiService.get('/ml/predictions').catch(() => [])
      ]);
      setCrimes(Array.isArray(crimeData) ? crimeData : []);
      setHotspots(Array.isArray(hotspotData) ? hotspotData : []);
      setPredictions(Array.isArray(predData) ? predData : []);
    } catch (err) {
      console.error('Error fetching map data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Crimes
  const filteredCrimes = crimes.filter(c => {
    const matchesArea = !searchArea || (c.area || c.location || '').toLowerCase().includes(searchArea.toLowerCase());
    const matchesType = selectedCrimeType === 'ALL' || c.crime_type === selectedCrimeType;
    const matchesYear = selectedYear === 'ALL' || (c.crime_date && c.crime_date.startsWith(selectedYear));
    return matchesArea && matchesType && matchesYear;
  });

  // Filtered Hotspots
  const filteredHotspots = hotspots.filter(h => {
    return !searchArea || (h.area_name || '').toLowerCase().includes(searchArea.toLowerCase());
  });

  // Unique crime types for dropdown
  const crimeTypes = ['ALL', ...new Set(crimes.map(c => c.crime_type).filter(Boolean))];
  const years = ['ALL', '2026', '2025', '2024'];

  const defaultCenter = [21.1458, 79.0882]; // Nagpur Center

  return (
    <div className="map-wrapper-card">
      {/* Map Control Toolbar */}
      <div className="map-toolbar">
        <div className="map-toolbar-row">
          {/* Search Input */}
          <div className="map-search-box">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search area (e.g. Sadar, Sitabuldi)..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
            />
          </div>

          {/* Crime Type Filter */}
          <div className="map-filter-group">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedCrimeType}
              onChange={(e) => setSelectedCrimeType(e.target.value)}
            >
              {crimeTypes.map(t => (
                <option key={t} value={t}>{t === 'ALL' ? 'All Crime Types' : t}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="map-filter-group">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(y => (
                <option key={y} value={y}>{y === 'ALL' ? 'All Years' : y}</option>
              ))}
            </select>
          </div>

          <button className="map-refresh-btn" onClick={fetchMapData} title="Refresh Map Data">
            <Navigation size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Dynamic Layer Toggles */}
        <div className="map-layer-toggles">
          <span className="toggle-label"><Layers size={14} /> Map Layers:</span>
          
          <label className={`layer-chip ${showCrimes ? 'active blue' : ''}`}>
            <input
              type="checkbox"
              checked={showCrimes}
              onChange={(e) => setShowCrimes(e.target.checked)}
            />
            <span>Historical Crimes ({filteredCrimes.length})</span>
          </label>

          <label className={`layer-chip ${showDensity ? 'active purple' : ''}`}>
            <input
              type="checkbox"
              checked={showDensity}
              onChange={(e) => setShowDensity(e.target.checked)}
            />
            <span>Crime Density</span>
          </label>

          <label className={`layer-chip ${showHotspots ? 'active red' : ''}`}>
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
            />
            <span>Detected Hotspots ({filteredHotspots.length})</span>
          </label>

          <label className={`layer-chip ${showPredictions ? 'active amber' : ''}`}>
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => setShowPredictions(e.target.checked)}
            />
            <span>Predicted Risk Areas ({predictions.length})</span>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div className="leaflet-container-box">
        {loading && <div className="map-loading-overlay">Loading Crime Intelligence Geospatial Map...</div>}
        
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '580px', borderRadius: '12px' }}
        >
          {/* CartoDB Dark Matter Base Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Layer 1: Historical Crimes */}
          {showCrimes && filteredCrimes.map((c) => (
            c.latitude && c.longitude && (
              <Marker
                key={`crime-${c.id}`}
                position={[c.latitude, c.longitude]}
                icon={crimeIcon}
              >
                <Popup className="crimevista-popup">
                  <div className="popup-card">
                    <div className="popup-header blue">
                      <MapPin size={14} />
                      <span>{c.crime_id || `CR-${c.id}`}</span>
                    </div>
                    <div className="popup-body">
                      <h4>{c.crime_type}</h4>
                      <p><strong>Area:</strong> {c.area || c.location}</p>
                      <p><strong>Date:</strong> {c.crime_date || 'N/A'}</p>
                      <p><strong>Police Station:</strong> {c.police_station || 'Nagpur Central'}</p>
                      <p><strong>Severity:</strong> <span className={`severity-tag ${c.severity?.toLowerCase()}`}>{c.severity || 'Medium'}</span></p>
                      {c.description && <p className="popup-desc">{c.description}</p>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Layer 2: Crime Density Circles */}
          {showDensity && filteredCrimes.map((c) => (
            c.latitude && c.longitude && (
              <Circle
                key={`density-${c.id}`}
                center={[c.latitude, c.longitude]}
                radius={350}
                pathOptions={{
                  color: '#8b5cf6',
                  fillColor: '#a855f7',
                  fillOpacity: 0.15,
                  stroke: false
                }}
              />
            )
          ))}

          {/* Layer 3: Detected Hotspots */}
          {showHotspots && filteredHotspots.map((h) => (
            h.latitude && h.longitude && (
              <React.Fragment key={`hotspot-${h.id}`}>
                <Circle
                  center={[h.latitude, h.longitude]}
                  radius={(h.radius_km || 0.8) * 1000}
                  pathOptions={{
                    color: h.risk_level === 'CRITICAL' ? '#dc2626' : (h.risk_level === 'HIGH' ? '#ef4444' : '#f97316'),
                    fillColor: h.risk_level === 'CRITICAL' ? '#dc2626' : '#ef4444',
                    fillOpacity: 0.35,
                    weight: 2
                  }}
                />
                <Marker
                  position={[h.latitude, h.longitude]}
                  icon={hotspotIcon}
                >
                  <Popup className="crimevista-popup">
                    <div className="popup-card red">
                      <div className="popup-header red">
                        <Flame size={16} />
                        <span>HOTSPOT {h.hotspot_code || `#H00${h.id}`}</span>
                      </div>
                      <div className="popup-body">
                        <h4>{h.area_name}</h4>
                        <div className="popup-stat-grid">
                          <div>
                            <span className="lbl">Recorded Crimes:</span>
                            <span className="val">{h.crime_count}</span>
                          </div>
                          <div>
                            <span className="lbl">Dominant Crime:</span>
                            <span className="val">{h.dominant_crime}</span>
                          </div>
                          <div>
                            <span className="lbl">Predicted Count:</span>
                            <span className="val">{h.predicted_count || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="lbl">Risk Level:</span>
                            <span className={`risk-badge ${h.risk_level?.toLowerCase()}`}>{h.risk_level}</span>
                          </div>
                        </div>
                        <p className="method-text">Algorithm: {h.detection_method || 'DBSCAN Spatial Density'}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            )
          ))}

          {/* Layer 4: Predicted Risk Areas */}
          {showPredictions && predictions.map((p) => (
            p.latitude && p.longitude && (
              <Marker
                key={`pred-${p.id}`}
                position={[p.latitude, p.longitude]}
                icon={predictedIcon}
              >
                <Popup className="crimevista-popup">
                  <div className="popup-card amber">
                    <div className="popup-header amber">
                      <AlertTriangle size={14} />
                      <span>AI Crime Prediction</span>
                    </div>
                    <div className="popup-body">
                      <h4>{p.area_name}</h4>
                      <p><strong>Predicted Crime:</strong> {p.crime_type || 'All Categories'}</p>
                      <p><strong>Prediction Period:</strong> {p.prediction_month || ''} {p.prediction_year || ''}</p>
                      <p><strong>Predicted Count:</strong> <strong style={{ color: '#f59e0b' }}>{p.predicted_crime_count}</strong></p>
                      <p><strong>Risk Level:</strong> <span className={`risk-badge ${p.risk_level?.toLowerCase()}`}>{p.risk_level}</span></p>
                      <p className="disclaimer-mini">AI Model: {p.model_name || 'Random Forest'}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
