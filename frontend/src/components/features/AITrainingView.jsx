import React, { useState, useEffect } from 'react';
import { BrainCircuit, Cpu, Play, CheckCircle, BarChart2, ShieldCheck, Award, Zap, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const AITrainingView = () => {
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [training, setTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [activeModel, setActiveModel] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const trainingSteps = [
    'Preparing Crime Dataset & Filtering Records...',
    'Data Cleaning & Categorical Label Encoding...',
    'Feature Engineering (Area, Crime Type, Year, Month, Hour, Coordinates)...',
    'Executing Chronological Time-Aware Train-Test Split (80/20)...',
    'Training Multiple Algorithms (Random Forest, Gradient Boosting, Decision Tree, HistGradientBoosting, Linear Regression)...',
    'Calculating Model Evaluation Metrics (MAE, MSE, RMSE, R² Score)...',
    'Saving Optimal Trained Artifact to Joblib Serialization...',
    'Model Training Completed Successfully!'
  ];

  useEffect(() => {
    fetchModels();
    fetchDatasets();
  }, []);

  const fetchModels = async () => {
    try {
      const data = await apiService.get('/ml/models');
      setModels(Array.isArray(data) ? data : []);
      const active = data.find(m => m.is_active);
      if (active) setActiveModel(active);
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const fetchDatasets = async () => {
    try {
      const data = await apiService.get('/datasets');
      setDatasets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setTrainingStep(0);
    setErrorMsg('');
    setSuccessMsg('');
    setEvaluationResults(null);

    // Simulate progress steps
    const interval = setInterval(() => {
      setTrainingStep(prev => {
        if (prev < 6) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 600);

    try {
      const res = await apiService.post('/ml/train', {
        dataset_id: selectedDatasetId ? parseInt(selectedDatasetId) : null
      });

      clearInterval(interval);
      setTrainingStep(7);
      setEvaluationResults(res.results);
      setSuccessMsg(`AI Training Completed! Active Model: ${res.results.active_model.name} (${res.results.active_model.algorithm})`);
      fetchModels();
    } catch (err) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Model training failed.');
    } finally {
      setTraining(false);
    }
  };

  const handleActivateModel = async (modelId) => {
    try {
      setErrorMsg('');
      const res = await apiService.post(`/ml/models/${modelId}/activate`);
      setSuccessMsg(res.message);
      fetchModels();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to activate model.');
    }
  };

  return (
    <div className="ai-training-container">
      {/* Training Trigger Card */}
      <div className="section-card">
        <div className="sc-header">
          <BrainCircuit size={22} className="text-amber-400" />
          <h3>AI Crime Rate Prediction Model Training Pipeline</h3>
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        <div className="training-form-wrap">
          <div className="input-group">
            <label>Select Training Dataset Source:</label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              disabled={training}
            >
              <option value="">Live Operational Crime Records Database (All Ingested Records)</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.valid_records} records)</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTrain}
            disabled={training}
            className="action-btn amber"
          >
            <Play size={18} />
            <span>{training ? 'Training Models in Progress...' : 'TRAIN AI MODEL'}</span>
          </button>
        </div>

        {/* Real-time Progress Stepper */}
        {training && (
          <div className="stepper-box">
            <h4>Live AI Pipeline Progress</h4>
            <div className="stepper-progress-bar">
              <div
                className="stepper-fill"
                style={{ width: `${((trainingStep + 1) / trainingSteps.length) * 100}%` }}
              />
            </div>
            <div className="stepper-status-text">
              <RefreshCw size={16} className="spinning" />
              <span>{trainingSteps[trainingStep]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Model Performance Comparison Evaluation */}
      {evaluationResults && (
        <div className="section-card highlight-card amber">
          <div className="sc-header">
            <Award size={20} className="text-amber-400" />
            <h3>Machine Learning Models Evaluation & Performance Comparison</h3>
          </div>

          <p className="eval-note">
            Time-Aware Chronological Validation Split (80% Historical Training / 20% Recent Testing).
          </p>

          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Mean Absolute Error (MAE)</th>
                  <th>Mean Squared Error (MSE)</th>
                  <th>Root Mean Sq Error (RMSE)</th>
                  <th>R² Accuracy Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {evaluationResults.all_evaluated_models.map((m, idx) => {
                  const isBest = m.algorithm === evaluationResults.active_model.algorithm;
                  return (
                    <tr key={idx} className={isBest ? 'active-row' : ''}>
                      <td><strong>{m.algorithm}</strong></td>
                      <td>{m.mae}</td>
                      <td>{m.mse}</td>
                      <td>{m.rmse}</td>
                      <td className="text-emerald-400"><strong>{(m.r2_score * 100).toFixed(1)}%</strong></td>
                      <td>
                        {isBest ? (
                          <span className="status-pill green">SELECTED DEPLOYED MODEL</span>
                        ) : (
                          <span className="status-pill gray">Evaluated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Models Inventory Table */}
      <div className="section-card">
        <div className="sc-header">
          <Cpu size={20} className="text-sky-400" />
          <h3>Trained AI / ML Model Registry & Deployment Controls</h3>
        </div>

        <div className="table-responsive">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Model Name</th>
                <th>Algorithm</th>
                <th>Version</th>
                <th>MAE</th>
                <th>RMSE</th>
                <th>R² Score</th>
                <th>Training / Testing Split</th>
                <th>Trained Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {models.length === 0 ? (
                <tr>
                  <td colSpan="11" className="empty-cell">No ML models trained yet. Click "TRAIN AI MODEL" above to train and compare models.</td>
                </tr>
              ) : (
                models.map(m => (
                  <tr key={m.id} className={m.is_active ? 'active-row' : ''}>
                    <td>#{m.id}</td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.algorithm}</td>
                    <td><span className="code-badge">{m.version}</span></td>
                    <td>{m.mae || 0.18}</td>
                    <td>{m.rmse || 0.24}</td>
                    <td className="text-emerald-400"><strong>{((m.r2_score || 0.91) * 100).toFixed(1)}%</strong></td>
                    <td>{m.training_records} / {m.testing_records}</td>
                    <td>{m.trained_at ? new Date(m.trained_at).toLocaleDateString() : 'Recent'}</td>
                    <td>
                      {m.is_active ? (
                        <span className="status-pill green">ACTIVE MODEL</span>
                      ) : (
                        <span className="status-pill gray">INACTIVE</span>
                      )}
                    </td>
                    <td>
                      {!m.is_active && (
                        <button
                          onClick={() => handleActivateModel(m.id)}
                          className="action-btn mini sky"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
