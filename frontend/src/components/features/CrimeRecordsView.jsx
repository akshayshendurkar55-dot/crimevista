import React, { useState, useEffect } from 'react';
import { FileText, PlusSquare, Search, Filter, Edit, Trash2, Eye, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const CrimeRecordsView = ({ userRole = 'OFFICER' }) => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCrime, setEditingCrime] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial Form State
  const initialForm = {
    crime_type: 'Burglary',
    area: 'Sadar',
    location: 'Sadar Market Square',
    city: 'Nagpur',
    state: 'Maharashtra',
    latitude: 21.1550,
    longitude: 79.0900,
    crime_date: new Date().toISOString().split('T')[0],
    crime_time: '14:30',
    severity: 'Medium',
    police_station: 'Sadar Police Station',
    victim_age: 35,
    victim_gender: 'Male',
    weapon_used: 'None',
    description: '',
    status: 'OPEN'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCrimes();
  }, [search, areaFilter, typeFilter, statusFilter]);

  const fetchCrimes = async () => {
    setLoading(true);
    try {
      let query = `/crimes?search=${encodeURIComponent(search)}`;
      if (areaFilter) query += `&area=${encodeURIComponent(areaFilter)}`;
      if (typeFilter) query += `&crime_type=${encodeURIComponent(typeFilter)}`;
      if (statusFilter) query += `&status_filter=${encodeURIComponent(statusFilter)}`;

      const data = await apiService.get(query);
      setCrimes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch crime records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await apiService.post('/crimes', {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        victim_age: formData.victim_age ? parseInt(formData.victim_age) : null
      });

      setSuccessMsg(`Crime record ${res.crime.crime_id} added successfully. Database, map, and analytics updated.`);
      setShowAddModal(false);
      setFormData(initialForm);
      fetchCrimes();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add crime record.');
    }
  };

  const handleEditOpen = (crime) => {
    setEditingCrime(crime);
    setFormData({
      crime_type: crime.crime_type || 'Theft',
      area: crime.area || crime.location || 'Nagpur Central',
      location: crime.location || crime.area || 'Nagpur Central',
      city: crime.city || 'Nagpur',
      state: crime.state || 'Maharashtra',
      latitude: crime.latitude || 21.1458,
      longitude: crime.longitude || 79.0882,
      crime_date: crime.crime_date || new Date().toISOString().split('T')[0],
      crime_time: crime.crime_time || '12:00',
      severity: crime.severity || 'Medium',
      police_station: crime.police_station || 'Nagpur Central PS',
      victim_age: crime.victim_age || 30,
      victim_gender: crime.victim_gender || 'Male',
      weapon_used: crime.weapon_used || 'None',
      description: crime.description || '',
      status: crime.status || 'OPEN'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCrime) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await apiService.put(`/crimes/${editingCrime.id}`, {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        victim_age: formData.victim_age ? parseInt(formData.victim_age) : null
      });

      setSuccessMsg(`Crime record ${editingCrime.crime_id || editingCrime.id} updated successfully.`);
      setShowEditModal(false);
      setEditingCrime(null);
      fetchCrimes();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update crime record.');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete crime record ${code || id}? This will be permanently recorded in audit logs.`)) return;

    try {
      await apiService.delete(`/crimes/${id}`);
      setSuccessMsg(`Crime record ${code || id} deleted.`);
      fetchCrimes();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete crime record.');
    }
  };

  return (
    <div className="crime-records-container">
      <div className="section-card">
        <div className="sc-header justify-between">
          <div className="flex items-center gap-2">
            <FileText size={22} className="text-sky-400" />
            <h3>Operational Crime Records Database</h3>
          </div>

          {(userRole === 'OFFICER' || userRole === 'ADMIN') && (
            <button onClick={() => { setFormData(initialForm); setShowAddModal(true); }} className="action-btn primary">
              <PlusSquare size={18} />
              <span>ADD CRIME RECORD</span>
            </button>
          )}
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        {/* Filter Controls Bar */}
        <div className="records-filter-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by Crime ID, type, location, police station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-select-group">
            <input
              type="text"
              placeholder="Filter by Area (e.g. Sadar)"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="mini-input"
            />

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Crime Types</option>
              <option value="Burglary">Burglary</option>
              <option value="Vehicle Theft">Vehicle Theft</option>
              <option value="Cyber Fraud">Cyber Fraud</option>
              <option value="Assault">Assault</option>
              <option value="Robbery">Robbery</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="SOLVED">SOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="loading-state">Fetching crime records...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Crime ID</th>
                  <th>Crime Type</th>
                  <th>Date & Time</th>
                  <th>Area / Location</th>
                  <th>Police Station</th>
                  <th>Severity</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crimes.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-cell">No crime records match the criteria.</td>
                  </tr>
                ) : (
                  crimes.map(c => (
                    <tr key={c.id}>
                      <td><span className="code-badge">{c.crime_id || `CR-${c.id}`}</span></td>
                      <td><strong>{c.crime_type}</strong></td>
                      <td>{c.crime_date || 'Recent'} ({c.crime_time || '12:00'})</td>
                      <td>{c.area || c.location}</td>
                      <td>{c.police_station || 'Nagpur Central PS'}</td>
                      <td>
                        <span className={`severity-tag ${c.severity?.toLowerCase()}`}>
                          {c.severity || 'Medium'}
                        </span>
                      </td>
                      <td>{c.latitude?.toFixed(4)}</td>
                      <td>{c.longitude?.toFixed(4)}</td>
                      <td>
                        <span className={`status-pill ${c.status?.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-wrap">
                          <button
                            onClick={() => handleEditOpen(c)}
                            className="icon-btn text-sky-400"
                            title="Edit Crime Record"
                          >
                            <Edit size={16} />
                          </button>
                          {(userRole === 'ADMIN' || userRole === 'OFFICER') && (
                            <button
                              onClick={() => handleDelete(c.id, c.crime_id)}
                              className="icon-btn text-rose-400"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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

      {/* Add / Edit Crime Record Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{showEditModal ? `Edit Crime Record ${editingCrime?.crime_id}` : 'Add New Crime Record'}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="close-btn">&times;</button>
            </div>

            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} className="modal-form grid-2">
              <div className="input-group">
                <label>Crime Type / Category:</label>
                <select
                  value={formData.crime_type}
                  onChange={(e) => setFormData({ ...formData, crime_type: e.target.value })}
                >
                  <option value="Burglary">Burglary</option>
                  <option value="Vehicle Theft">Vehicle Theft</option>
                  <option value="Cyber Fraud">Cyber Fraud</option>
                  <option value="Assault">Assault</option>
                  <option value="Robbery">Robbery</option>
                  <option value="Chain Snatching">Chain Snatching</option>
                  <option value="Extortion">Extortion</option>
                  <option value="Vandalism">Vandalism</option>
                </select>
              </div>

              <div className="input-group">
                <label>Area / Zone:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sadar"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Specific Location / Landmark:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sadar Market Square"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Police Station:</label>
                <input
                  type="text"
                  required
                  value={formData.police_station}
                  onChange={(e) => setFormData({ ...formData, police_station: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Latitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Longitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Date of Incident:</label>
                <input
                  type="date"
                  required
                  value={formData.crime_date}
                  onChange={(e) => setFormData({ ...formData, crime_date: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Time of Incident:</label>
                <input
                  type="time"
                  required
                  value={formData.crime_time}
                  onChange={(e) => setFormData({ ...formData, crime_time: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Severity Level:</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="input-group">
                <label>Case Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="SOLVED">SOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="input-group full-width">
                <label>Description / Incident Notes:</label>
                <textarea
                  rows="3"
                  placeholder="Enter detailed description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-actions full-width">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="action-btn secondary">
                  Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  {showEditModal ? 'Save Record Updates' : 'ADD CRIME RECORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
