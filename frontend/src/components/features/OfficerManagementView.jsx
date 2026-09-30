import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Search, ShieldCheck, Trash2, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const OfficerManagementView = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    badge_id: '',
    rank: 'Inspector',
    police_station: 'Nagpur Central PS',
    assigned_zone: 'Zone 4'
  });

  useEffect(() => {
    fetchOfficers();
  }, [search]);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const data = await apiService.get(`/admin/officers${search ? `?search=${search}` : ''}`);
      setOfficers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load officers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiService.post('/admin/officers', formData);
      setSuccessMsg('Police Officer account registered successfully.');
      setShowAddModal(false);
      setFormData({
        name: '', email: '', password: '', badge_id: '',
        rank: 'Inspector', police_station: 'Nagpur Central PS', assigned_zone: 'Zone 4'
      });
      fetchOfficers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create officer.');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await apiService.put(`/admin/users/${userId}/toggle-status`);
      setSuccessMsg(res.message);
      fetchOfficers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update status.');
    }
  };

  const handleDeleteOfficer = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this officer account?')) return;
    try {
      await apiService.delete(`/admin/users/${userId}`);
      setSuccessMsg('Officer account deleted.');
      fetchOfficers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete officer.');
    }
  };

  return (
    <div className="officer-mgmt-container">
      <div className="section-card">
        <div className="sc-header justify-between">
          <div className="flex items-center gap-2">
            <UserCheck size={22} className="text-sky-400" />
            <h3>Police Officer Duty Registry</h3>
          </div>
          <button onClick={() => setShowAddModal(true)} className="action-btn sky">
            <UserPlus size={16} />
            <span>Register Police Officer</span>
          </button>
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search officers by name, badge ID, or station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading officer directory...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Officer Name</th>
                  <th>Badge ID</th>
                  <th>Rank</th>
                  <th>Police Station</th>
                  <th>Assigned Zone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">No police officers registered yet.</td>
                  </tr>
                ) : (
                  officers.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td><strong>{o.name}</strong></td>
                      <td><span className="code-badge sky">{o.badge_id}</span></td>
                      <td>{o.rank}</td>
                      <td>{o.police_station}</td>
                      <td>{o.assigned_zone}</td>
                      <td>
                        <span className={`status-pill ${o.is_active ? 'green' : 'red'}`}>
                          {o.is_active ? 'DUTY ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-wrap">
                          <button
                            onClick={() => handleToggleStatus(o.id)}
                            className="icon-btn text-amber-400"
                            title={o.is_active ? 'Suspend Duty' : 'Activate Duty'}
                          >
                            {o.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteOfficer(o.id)}
                            className="icon-btn text-rose-400"
                            title="Delete Officer"
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

      {/* Add Officer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register Police Officer Account</h3>
              <button onClick={() => setShowAddModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleCreateOfficer} className="modal-form">
              <div className="input-group">
                <label>Officer Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector V. Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Official Email:</label>
                <input
                  type="email"
                  required
                  placeholder="officer.sharma@police.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Password:</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Police Badge Number / ID:</label>
                <input
                  type="text"
                  required
                  placeholder="POL-4482"
                  value={formData.badge_id}
                  onChange={(e) => setFormData({ ...formData, badge_id: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Officer Rank:</label>
                <select
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                >
                  <option value="Inspector">Inspector</option>
                  <option value="Sub-Inspector">Sub-Inspector</option>
                  <option value="Senior Inspector">Senior Inspector</option>
                  <option value="Assistant Commissioner">Assistant Commissioner</option>
                </select>
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
                <label>Assigned Zone:</label>
                <input
                  type="text"
                  required
                  value={formData.assigned_zone}
                  onChange={(e) => setFormData({ ...formData, assigned_zone: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="action-btn secondary">Cancel</button>
                <button type="submit" className="action-btn sky">Register Officer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
