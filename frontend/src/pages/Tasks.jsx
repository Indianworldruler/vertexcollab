import { useEffect, useState } from 'react';
import api from '../api';

const STATUSES = ['todo', 'in-progress', 'done'];

const statusColors = {
  'todo': 'var(--color-text-muted)',
  'in-progress': 'var(--color-warning)',
  'done': 'var(--color-success)',
};

export default function Tasks() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState('');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', assignedTo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/api/workspaces').then((res) => {
      setWorkspaces(res.data);
      if (res.data.length > 0) setSelectedWs(res.data[0]._id);
    });
    if (user.role === 'admin') {
      api.get('/api/admin/users').then((res) => setUsers(res.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!selectedWs) return;
    setLoading(true);
    api.get(`/api/tasks?workspace=${selectedWs}`)
      .then((res) => setTasks(res.data))
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, [selectedWs]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedWs) return;
    setSaving(true);
    try {
      const res = await api.post('/api/tasks', { ...form, workspace: selectedWs });
      setTasks([res.data, ...tasks]);
      setForm({ title: '', description: '', status: 'todo', assignedTo: '' });
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch {
      alert('Failed to update task status.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch {
      alert('Failed to delete task.');
    }
  };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const columnTitles = { 'todo': '📋 To Do', 'in-progress': '⚡ In Progress', 'done': '✅ Done' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Board</h1>
          <p className="page-subtitle">Track and manage your team's work</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedWs}
            onChange={(e) => setSelectedWs(e.target.value)}
            id="task-workspace-select"
          >
            <option value="">Select workspace</option>
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>{ws.name}</option>
            ))}
          </select>
          <button
            id="create-task-btn"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!selectedWs}
          >
            + New Task
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!selectedWs ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">Select a workspace</div>
          <div className="empty-state-text">Choose a workspace to view its task board.</div>
        </div>
      ) : loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : (
        <div className="task-board">
          {STATUSES.map((status) => (
            <div key={status} className="task-column">
              <div className="task-column-header">
                <span className="task-column-title" style={{ color: statusColors[status] }}>
                  {columnTitles[status]}
                </span>
                <span className="task-count">{tasksByStatus(status).length}</span>
              </div>

              {tasksByStatus(status).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', textAlign: 'center', padding: '20px 0' }}>
                  No tasks
                </div>
              ) : (
                tasksByStatus(status).map((task) => (
                  <div key={task._id} className="task-item">
                    <div className="task-item-title">{task.title}</div>
                    {task.description && (
                      <div className="task-item-desc">{task.description}</div>
                    )}
                    <div className="task-item-footer">
                      <span className="task-assignee">
                        👤 {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {STATUSES.filter((s) => s !== status).map((s) => (
                        <button
                          key={s}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 10, padding: '3px 8px' }}
                          onClick={() => handleStatusChange(task._id, s)}
                          id={`task-${task._id}-move-${s}`}
                        >
                          → {s}
                        </button>
                      ))}
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: 10, padding: '3px 8px' }}
                        onClick={() => handleDelete(task._id)}
                        id={`task-${task._id}-delete`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Create New Task</div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-title">Title *</label>
                <input
                  id="task-title"
                  className="form-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Set up CI/CD pipeline"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional task details"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              {users.length > 0 && (
                <div className="form-group">
                  <label className="form-label" htmlFor="task-assign">Assign To</label>
                  <select
                    id="task-assign"
                    className="form-select"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="task-create-submit" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
