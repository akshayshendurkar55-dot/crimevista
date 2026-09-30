import React, { useState, useEffect } from 'react';
import { History, Shield, Lock, Search } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const AuditLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/admin/audit-logs');
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.user_email || '').toLowerCase().includes(q) ||
      (l.action || '').toLowerCase().includes(q) ||
      (l.resource || '').toLowerCase().includes(q) ||
      (l.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="audit-logs-container">
      <div className="section-card">
        <div className="sc-header justify-between">
          <div className="flex items-center gap-2">
            <History size={22} className="text-purple-400" />
            <h3>System Security & Audit Activity Logs</h3>
          </div>
          <button onClick={fetchAuditLogs} className="action-btn secondary">Refresh Logs</button>
        </div>

        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search audit logs by email, action, role, or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading audit logs...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>User / Email</th>
                  <th>Role</th>
                  <th>Action Performed</th>
                  <th>Target Resource</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">No audit log events found.</td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr key={l.id}>
                      <td>#{l.id}</td>
                      <td>{l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Recent'}</td>
                      <td><strong>{l.user_email || 'System'}</strong></td>
                      <td><span className={`role-pill ${l.role?.toLowerCase()}`}>{l.role || 'SYSTEM'}</span></td>
                      <td><span className="code-badge purple">{l.action}</span></td>
                      <td>{l.resource || 'N/A'}</td>
                      <td>{l.ip_address || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
