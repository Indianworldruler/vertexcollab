import { useEffect, useState } from 'react';
import api from '../api';

const FILE_TYPES = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'CSV', 'PNG', 'JPG', 'ZIP', 'Other'];

const fileIcons = {
  PDF: '📕', DOCX: '📘', XLSX: '📗', PPTX: '📙',
  TXT: '📄', CSV: '📊', PNG: '🖼️', JPG: '🖼️',
  ZIP: '🗜️', Other: '📁',
};

export default function Documents() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', fileType: 'PDF', fileSize: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/workspaces').then((res) => {
      setWorkspaces(res.data);
      if (res.data.length > 0) setSelectedWs(res.data[0]._id);
    }).catch(() => setError('Failed to load workspaces.'));
  }, []);

  useEffect(() => {
    if (!selectedWs) return;
    setLoading(true);
    api.get(`/api/documents?workspace=${selectedWs}`)
      .then((res) => setDocuments(res.data))
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoading(false));
  }, [selectedWs]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedWs) return;
    setSaving(true);
    try {
      const res = await api.post('/api/documents', { ...form, workspace: selectedWs });
      setDocuments([res.data, ...documents]);
      setForm({ title: '', description: '', fileType: 'PDF', fileSize: '' });
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add document.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this document?')) return;
    try {
      await api.delete(`/api/documents/${id}`);
      setDocuments(documents.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Shared document metadata for your workspace</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedWs}
            onChange={(e) => setSelectedWs(e.target.value)}
            id="doc-workspace-select"
          >
            <option value="">Select workspace</option>
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>{ws.name}</option>
            ))}
          </select>
          <button
            id="add-document-btn"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!selectedWs}
          >
            + Add Document
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div
        className="card"
        style={{ marginBottom: 20, borderColor: 'rgba(108,99,255,0.25)', padding: '12px 18px' }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            This page stores <b>document metadata only</b> (title, type, size). No files are uploaded to the server.
            This keeps the platform lightweight for the DevOps demonstration.
          </span>
        </div>
      </div>

      {!selectedWs ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">Select a workspace</div>
          <div className="empty-state-text">Choose a workspace to view its documents.</div>
        </div>
      ) : loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">No documents yet</div>
          <div className="empty-state-text">Add your first document record to this workspace.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.map((doc) => (
            <div key={doc._id} className="doc-item">
              <div className="doc-icon">
                {fileIcons[doc.fileType] || '📁'}
              </div>
              <div className="doc-info">
                <div className="doc-name">{doc.title}</div>
                <div className="doc-meta">
                  {doc.description && <span>{doc.description} · </span>}
                  <span className="badge badge-todo" style={{ marginRight: 6 }}>{doc.fileType}</span>
                  {doc.fileSize && <span>{doc.fileSize} · </span>}
                  Uploaded by <b>{doc.uploadedBy?.name || 'Unknown'}</b> on {formatDate(doc.createdAt)}
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(doc._id)}
                id={`doc-delete-${doc._id}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Add Document Metadata</div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-title">Document Title *</label>
                <input
                  id="doc-title"
                  className="form-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Architecture Diagram Q2"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-desc">Description</label>
                <input
                  id="doc-desc"
                  className="form-input"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-type">File Type</label>
                <select
                  id="doc-type"
                  className="form-select"
                  value={form.fileType}
                  onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                >
                  {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-size">File Size</label>
                <input
                  id="doc-size"
                  className="form-input"
                  type="text"
                  value={form.fileSize}
                  onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                  placeholder="e.g., 2.4 MB"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="doc-create-submit" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding…' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
