import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Fetch health check
    api.get('/health').then((res) => setHealth(res.data)).catch(() => setHealth({ status: 'error' }));

    // Fetch admin stats if admin
    if (user.role === 'admin') {
      api.get('/api/admin/stats').then((res) => setStats(res.data)).catch(() => {});
    }
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {greeting}, {user.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Welcome to VertexCollab – your enterprise collaboration hub</p>
        </div>
        <div>
          {health && (
            <span className={`badge ${health.status === 'ok' ? 'badge-done' : 'badge-todo'}`}>
              {health.status === 'ok' ? '● System Healthy' : '● System Error'}
            </span>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid-3 mb-3">
        {[
          { icon: '🏢', title: 'Workspaces', desc: 'Create and manage your team workspaces', link: '/workspaces' },
          { icon: '💬', title: 'Channels', desc: 'Browse and chat in channels', link: '/channels' },
          { icon: '✅', title: 'Tasks', desc: 'Track tasks with a Kanban board', link: '/tasks' },
          { icon: '📄', title: 'Documents', desc: 'Share and manage document metadata', link: '/documents' },
          { icon: '⚡', title: 'Health API', desc: `Backend: ${health?.status || 'checking…'}`, link: null },
          { icon: '🛡️', title: 'Admin Panel', desc: 'Platform-wide statistics and user management', link: user.role === 'admin' ? '/admin' : null },
        ].map((item) => (
          <div key={item.title} className="card" style={{ cursor: item.link ? 'pointer' : 'default' }}
            onClick={() => item.link && (window.location.href = item.link)}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
            <div className="card-title">{item.title}</div>
            <div className="card-meta">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Admin stats */}
      {user.role === 'admin' && stats && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--color-text-muted)' }}>
            Platform Overview
          </h2>
          <div className="grid-3">
            {[
              { icon: '👤', label: 'Users', value: stats.users },
              { icon: '🏢', label: 'Workspaces', value: stats.workspaces },
              { icon: '💬', label: 'Channels', value: stats.channels },
              { icon: '📨', label: 'Messages', value: stats.messages },
              { icon: '✅', label: 'Tasks', value: stats.tasks },
              { icon: '📄', label: 'Documents', value: stats.documents },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="card mt-3" style={{ borderColor: 'rgba(108,99,255,0.3)', marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 22 }}>ℹ️</span>
          <div>
            <div className="card-title">Getting Started</div>
            <div className="card-meta" style={{ marginTop: 6 }}>
              1. Go to <b>Workspaces</b> and create your first workspace.<br />
              2. Create <b>Channels</b> inside a workspace and start messaging.<br />
              3. Use the <b>Tasks</b> board to assign and track work.<br />
              4. Use <b>Documents</b> to share file metadata with your team.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
