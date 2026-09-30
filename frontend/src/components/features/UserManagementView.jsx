import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldCheck, Trash2, Edit2, ToggleLeft, ToggleRight, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    badge_number: '',
    department: 'Verified Citizen'
  });

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.get(`/admin/users${search ? `?search=${search}` : ''}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiService.post('/admin/users', formData);
      setSuccessMsg('User account created successfully.');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'USER', badge_number: '', department: 'Verified Citizen' });
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user.');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await apiService.put(`/admin/users/${userId}/toggle-status`);
      setSuccessMsg(res.message);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiService.delete(`/admin/users/${userId}`);
      setSuccessMsg('User deleted.');
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="user-mgmt-container">
      <div className="section-card">
        <div className="sc-header justify-between">
          <div className="flex items-center gap-2">
            <Users size={22} className="text-rose-400" />
            <h3>User Account Management</h3>
          </div>
          <button onClick={() => setShowAddModal(true)} className="action-btn primary">
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>

        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        {/* Search Bar */}
        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or badge number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-state">Loading user registry...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Badge / ID</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-cell">No users found.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-pill ${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td><span className="code-badge">{u.badge_number || 'PUBLIC'}</span></td>
                      <td>{u.department || 'N/A'}</td>
                      <td>
                        <span className={`status-pill ${u.is_active ? 'green' : 'red'}`}>
                          {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent'}</td>
                      <td>
                        <div className="action-buttons-wrap">
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className="icon-btn text-amber-400"
                            title={u.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {u.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="icon-btn text-rose-400"
                            title="Delete User"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create User Account</h3>
              <button onClick={() => setShowAddModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="input-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Email Address:</label>
                <input
                  type="email"
                  required
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
                <label>Role:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="USER">USER (Citizen Public Access)</option>
                  <option value="OFFICER">OFFICER (Police Operational)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="action-btn secondary">Cancel</button>
                <button type="submit" className="action-btn primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
