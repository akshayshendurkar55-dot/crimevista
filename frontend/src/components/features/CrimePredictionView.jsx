import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldAlert, Sparkles, CheckCircle, Info } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const CrimePredictionView = () => {
  const [areaName, setAreaName] = useState('Sadar');
  const [crimeType, setCrimeType] = useState('Burglary');
  const [year, setYear] = useState(2027);
  const [monthName, setMonthName] = useState('January');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const areas = [
    'Sadar', 'Sitabuldi', 'Dharampeth', 'Jaripatka', 'Mahal',
    'Khamla', 'Manewada', 'Mankapur', 'Sakkardara', 'Nandanvan',
    'Lakadganj', 'Pardi', 'Wadi', 'Hingna', 'Koradi'
  ];

  const crimeTypes = [
    'Burglary', 'Vehicle Theft', 'Cyber Fraud', 'Assault',
    'Robbery', 'Chain Snatching', 'Extortion', 'Vandalism'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiService.post('/ml/predict', {
        area_name: areaName,
        crime_type: crimeType,
        year: parseInt(year),
        month_name: monthName
      });
      setPredictionResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crime-predict-container">
      <div className="section-card">
        <div className="sc-header">
          <TrendingUp size={22} className="text-amber-400" />
          <h3>Geospatial AI Crime Rate Prediction Engine</h3>
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

        <form onSubmit={handlePredict} className="prediction-form-grid">
          <div className="input-group">
            <label>Select Target Area / Zone:</label>
            <select value={areaName} onChange={(e) => setAreaName(e.target.value)}>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Select Crime Category:</label>
            <select value={crimeType} onChange={(e) => setCrimeType(e.target.value)}>
              {crimeTypes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Prediction Year:</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value={2027}>2027 (Future Forecast)</option>
              <option value={2026}>2026 (Current Year)</option>
              <option value={2025}>2025 (Historical)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Prediction Month:</label>
            <select value={monthName} onChange={(e) => setMonthName(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="form-submit-full">
            <button type="submit" disabled={loading} className="action-btn primary large">
              <Sparkles size={18} />
              <span>{loading ? 'Executing AI Inference Model...' : 'PREDICT CRIME RATE'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Prediction Output Card */}
      {predictionResult && (
        <div className="section-card highlight-card result-card">
          <div className="sc-header">
            <ShieldAlert size={22} className="text-amber-400" />
            <h3>Crime Prediction & Risk Assessment Output</h3>
          </div>

          <div className="prediction-results-grid">
            <div className="res-stat-box count-box">
              <span className="res-lbl">Predicted Crime Count / Rate</span>
              <span className="res-val-big">{predictionResult.predicted_crime_count}</span>
              <span className="res-sub">Estimated Incidents in Period</span>
            </div>

            <div className="res-stat-box risk-box">
              <span className="res-lbl">Assessed Risk Level</span>
              <span className={`risk-badge-hero ${predictionResult.risk_level?.toLowerCase()}`}>
                {predictionResult.risk_level} RISK
              </span>
              <span className="res-sub">Risk Score Index: {(predictionResult.risk_score * 100).toFixed(0)} / 100</span>
            </div>

            <div className="res-details-box">
              <div className="detail-row">
                <span className="lbl">Target Area:</span>
                <span className="val">{predictionResult.area_name}</span>
              </div>
              <div className="detail-row">
                <span className="lbl">Crime Type:</span>
                <span className="val">{predictionResult.crime_type}</span>
              </div>
              <div className="detail-row">
                <span className="lbl">Prediction Period:</span>
                <span className="val">{predictionResult.prediction_period}</span>
              </div>
              <div className="detail-row">
                <span className="lbl">Active Model:</span>
                <span className="val">{predictionResult.model_name} ({predictionResult.model_version})</span>
              </div>
            </div>
          </div>

          {/* Mandatory Public / Officer Disclaimer */}
          <div className="mandatory-disclaimer-box">
            <Info size={16} className="text-sky-400" />
            <span>
              <strong>Disclaimer:</strong> {predictionResult.disclaimer}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
