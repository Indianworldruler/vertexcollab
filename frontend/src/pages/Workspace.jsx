import { useEffect, useState } from 'react';
import api from '../api';

export default function Workspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/api/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      setError('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Workspace name is required.'); return; }
    setSaving(true);
    try {
      await api.post('/api/workspaces', form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchWorkspaces();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create workspace.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workspace?')) return;
    try {
      await api.delete(`/api/workspaces/${id}`);
      setWorkspaces(workspaces.filter((w) => w._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workspace.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspaces</h1>
          <p className="page-subtitle">Organize your teams and projects</p>
        </div>
        <button
          id="create-workspace-btn"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Workspace
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : workspaces.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <div className="empty-state-title">No workspaces yet</div>
          <div className="empty-state-text">Create your first workspace to get started.</div>
        </div>
      ) : (
        <div className="grid-3">
          {workspaces.map((ws) => (
            <div key={ws._id} className="card">
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
              <div className="card-title">{ws.name}</div>
              <div className="card-meta" style={{ marginBottom: 12 }}>
                {ws.description || 'No description'}<br />
                <span style={{ marginTop: 4, display: 'block' }}>
                  Created by: {ws.createdBy?.name || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(ws._id)}
                  id={`delete-ws-${ws._id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Create New Workspace</div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-name">Workspace Name *</label>
                <input
                  id="ws-name"
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Engineering, Marketing"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-desc">Description</label>
                <textarea
                  id="ws-desc"
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button id="ws-create-submit" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
