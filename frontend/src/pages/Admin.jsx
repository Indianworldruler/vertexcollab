import { useEffect, useState } from 'react';
import api from '../api';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [health, setHealth] = useState(null);
  const [ready, setReady] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, healthRes, readyRes] = await Promise.allSettled([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/health'),
        api.get('/ready'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
      if (readyRes.status === 'fulfilled') setReady(readyRes.value.data);
      else setReady({ status: 'not ready', database: 'disconnected' });
    } catch (err) {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
      setStats((prev) => prev ? { ...prev, users: prev.users - 1 } : prev);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const statItems = stats
    ? [
        { icon: '👤', label: 'Total Users', value: stats.users, color: 'var(--color-primary)' },
        { icon: '🏢', label: 'Workspaces', value: stats.workspaces, color: 'var(--color-info)' },
        { icon: '💬', label: 'Channels', value: stats.channels, color: 'var(--color-warning)' },
        { icon: '📨', label: 'Messages', value: stats.messages, color: 'var(--color-success)' },
        { icon: '✅', label: 'Tasks', value: stats.tasks, color: '#c084fc' },
        { icon: '📄', label: 'Documents', value: stats.documents, color: '#fb7185' },
      ]
    : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide statistics and user management</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} id="admin-refresh-btn">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* System Status */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div
          className="card"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderColor: health?.status === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
          }}
        >
          <span style={{ fontSize: 24 }}>{health?.status === 'ok' ? '🟢' : '🔴'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Health Check</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              GET /health → {health?.status || 'checking…'}
            </div>
          </div>
        </div>
        <div
          className="card"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderColor: ready?.status === 'ready' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
          }}
        >
          <span style={{ fontSize: 24 }}>{ready?.status === 'ready' ? '🟢' : '🔴'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Readiness Check</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              GET /ready → DB {ready?.database || 'checking…'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Platform Statistics
          </h2>
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {statItems.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Registered Users
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-title">No users found</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u._id}>
                      <td style={{ color: 'var(--color-text-subtle)' }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-chip ${u.role}`}>{u.role}</span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          id={`admin-delete-user-${u._id}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
