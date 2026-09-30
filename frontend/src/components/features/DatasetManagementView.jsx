import React, { useState, useEffect } from 'react';
import { Database, Upload, CheckCircle, AlertTriangle, FileText, Trash2, Eye, ShieldAlert, Sparkles, ArrowRight, RefreshCw, Table } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const DatasetManagementView = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeDataset, setActiveDataset] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [cleaningResult, setCleaningResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/datasets');
      setDatasets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a CSV or Excel file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await apiService.uploadFile('/datasets/upload', formData);
      setSuccessMsg(`Dataset "${selectedFile.name}" uploaded and validated successfully.`);
      setSelectedFile(null);
      fetchDatasets();
      if (res.dataset) {
        setActiveDataset(res.dataset);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Dataset upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleClean = async (id) => {
    try {
      setErrorMsg('');
      const res = await apiService.post(`/datasets/${id}/clean`);
      setCleaningResult(res.cleaning_result);
      setSuccessMsg(`Dataset cleaned successfully. Removed ${res.cleaning_result.records_removed} invalid/duplicate records.`);
      fetchDatasets();
    } catch (err) {
      setErrorMsg(err.message || 'Data cleaning failed.');
    }
  };

  const handlePreview = async (dataset) => {
    setActiveDataset(dataset);
    try {
      setErrorMsg('');
      const res = await apiService.get(`/datasets/${dataset.id}/preview`);
      setPreviewData(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to preview dataset.');
    }
  };

  const handleApprove = async (id) => {
    try {
      setErrorMsg('');
      const res = await apiService.post(`/datasets/${id}/approve`);
      setSuccessMsg(`Dataset approved! ${res.result.records_ingested} crime records ingested into database.`);
      fetchDatasets();
      if (activeDataset && activeDataset.id === id) {
        setActiveDataset({ ...activeDataset, status: 'APPROVED' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to approve dataset.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await apiService.delete(`/datasets/${id}`);
      setSuccessMsg('Dataset deleted.');
      if (activeDataset?.id === id) {
        setActiveDataset(null);
        setPreviewData(null);
      }
      fetchDatasets();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete dataset.');
    }
  };

  const filteredPreviewRows = previewData?.preview_records?.filter(r => {
    if (!searchQuery) return true;
    return Object.values(r).some(val => String(val || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }) || [];

  return (
    <div className="dataset-mgmt-container">
      {/* Upload Card */}
      <div className="section-card upload-banner">
        <div className="sc-header">
          <Upload size={20} className="text-purple-400" />
          <h3>Upload & Validate Crime Dataset</h3>
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-drop-zone">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              id="dataset-file-input"
            />
            <label htmlFor="dataset-file-input" className="file-drop-label">
              <FileText size={32} className="text-purple-400" />
              <span>{selectedFile ? selectedFile.name : 'Click or Drag CSV / Excel dataset file here'}</span>
              <span className="sub-tip">Supported formats: .csv, .xlsx, .xls</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="action-btn primary"
          >
            {uploading ? 'Processing & Validating...' : 'Upload & Run Automated Pipeline'}
          </button>
        </form>
      </div>

      {/* Dataset History Table */}
      <div className="section-card">
        <div className="sc-header">
          <Database size={20} className="text-sky-400" />
          <h3>Uploaded Datasets Pipeline</h3>
        </div>

        {loading ? (
          <div className="loading-state">Loading dataset inventory...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dataset Name</th>
                  <th>Filename</th>
                  <th>Total Records</th>
                  <th>Valid Records</th>
                  <th>Duplicates</th>
                  <th>Invalid Coords</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-cell">No crime datasets uploaded yet. Upload a CSV file above.</td>
                  </tr>
                ) : (
                  datasets.map(d => (
                    <tr key={d.id} className={activeDataset?.id === d.id ? 'active-row' : ''}>
                      <td>#{d.id}</td>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.filename}</td>
                      <td>{d.total_records}</td>
                      <td className="text-emerald-400">{d.valid_records}</td>
                      <td className="text-amber-400">{d.duplicate_records}</td>
                      <td className="text-rose-400">{d.invalid_coordinates}</td>
                      <td>
                        <span className={`status-pill ${d.status?.toLowerCase()}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>{d.uploaded_by || 'Admin'}</td>
                      <td>
                        <div className="action-buttons-wrap">
                          <button
                            onClick={() => handlePreview(d)}
                            className="icon-btn text-sky-400"
                            title="Preview & Validate"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {d.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleClean(d.id)}
                              className="icon-btn text-purple-400"
                              title="Clean Dataset"
                            >
                              <Sparkles size={16} />
                            </button>
                          )}

                          {d.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApprove(d.id)}
                              className="icon-btn text-emerald-400"
                              title="Approve & Ingest to Database"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(d.id)}
                            className="icon-btn text-rose-400"
                            title="Delete Dataset"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cleaning Result Banner */}
      {cleaningResult && (
        <div className="section-card highlight-card">
          <div className="sc-header">
            <Sparkles size={20} className="text-purple-400" />
            <h3>Data Cleaning Report Statistics</h3>
          </div>
          <div className="cleaning-stats-grid">
            <div className="stat-box">
              <span className="lbl">Before Cleaning Rows</span>
              <span className="val">{cleaningResult.before_cleaning.rows}</span>
            </div>
            <div className="stat-box">
              <span className="lbl">After Cleaning Rows</span>
              <span className="val text-emerald-400">{cleaningResult.after_cleaning.rows}</span>
            </div>
            <div className="stat-box">
              <span className="lbl">Duplicates & Invalid Removed</span>
              <span className="val text-amber-400">{cleaningResult.records_removed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview Container */}
      {previewData && (
        <div className="section-card">
          <div className="sc-header">
            <Table size={20} className="text-emerald-400" />
            <h3>Dataset Preview & Validation Inspection: {activeDataset?.name}</h3>
          </div>

          <div className="preview-toolbar">
            <input
              type="text"
              placeholder="Search records in preview table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="preview-search"
            />
            <span className="preview-count">Showing {filteredPreviewRows.length} of {previewData.summary.total_rows} records</span>
          </div>

          <div className="table-responsive max-height-preview">
            <table className="custom-data-table">
              <thead>
                <tr>
                  {previewData.summary.columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPreviewRows.slice(0, 30).map((row, idx) => (
                  <tr key={idx}>
                    {previewData.summary.columns.map(col => (
                      <td key={col}>{String(row[col] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
