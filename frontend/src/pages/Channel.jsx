import { useEffect, useState, useRef } from 'react';
import api from '../api';

export default function Channel() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  // Load workspaces
  useEffect(() => {
    api.get('/api/workspaces').then((res) => {
      setWorkspaces(res.data);
      if (res.data.length > 0) setSelectedWs(res.data[0]._id);
    }).catch(() => setError('Failed to load workspaces.'));
  }, []);

  // Load channels when workspace changes
  useEffect(() => {
    if (!selectedWs) return;
    setSelectedChannel(null);
    setMessages([]);
    api.get(`/api/channels?workspace=${selectedWs}`)
      .then((res) => setChannels(res.data))
      .catch(() => setError('Failed to load channels.'));
  }, [selectedWs]);

  // Load messages when channel changes
  useEffect(() => {
    if (!selectedChannel) return;
    setLoadingMsgs(true);
    api.get(`/api/messages?channel=${selectedChannel._id}`)
      .then((res) => { setMessages(res.data); })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [selectedChannel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !selectedWs) return;
    try {
      const res = await api.post('/api/channels', { ...form, workspace: selectedWs });
      setChannels([...channels, res.data]);
      setForm({ name: '', description: '' });
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create channel.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedChannel) return;
    try {
      const res = await api.post('/api/messages', { content: newMsg, channel: selectedChannel._id });
      setMessages([...messages, res.data]);
      setNewMsg('');
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Channels</h1>
          <p className="page-subtitle">Team communication channels</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedWs}
            onChange={(e) => setSelectedWs(e.target.value)}
            id="workspace-select"
          >
            <option value="">Select workspace</option>
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>{ws.name}</option>
            ))}
          </select>
          <button
            id="create-channel-btn"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!selectedWs}
          >
            + Channel
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!selectedWs ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <div className="empty-state-title">No workspace selected</div>
          <div className="empty-state-text">Create a workspace first, then come back here.</div>
        </div>
      ) : (
        <div className="channel-layout" style={{ flex: 1 }}>
          {/* Channel list */}
          <div className="channel-list-panel">
            <div className="channel-list-header">Channels</div>
            {channels.length === 0 ? (
              <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--color-text-subtle)' }}>
                No channels yet
              </div>
            ) : (
              channels.map((ch) => (
                <div
                  key={ch._id}
                  className={`channel-list-item${selectedChannel?._id === ch._id ? ' active' : ''}`}
                  onClick={() => setSelectedChannel(ch)}
                  id={`channel-${ch._id}`}
                >
                  # {ch.name}
                </div>
              ))
            )}
          </div>

          {/* Message panel */}
          <div className="message-panel">
            {!selectedChannel ? (
              <div className="empty-state" style={{ marginTop: 60 }}>
                <div className="empty-state-icon">💬</div>
                <div className="empty-state-title">Select a channel</div>
                <div className="empty-state-text">Choose a channel to view and send messages.</div>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <span style={{ color: 'var(--color-primary)' }}>#</span>
                  {selectedChannel.name}
                  {selectedChannel.description && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 400 }}>
                      — {selectedChannel.description}
                    </span>
                  )}
                </div>

                <div className="messages-list">
                  {loadingMsgs ? (
                    <div className="spinner-container"><div className="spinner" /></div>
                  ) : messages.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">💭</div>
                      <div className="empty-state-title">No messages yet</div>
                      <div className="empty-state-text">Be the first to say something!</div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg._id} className="message-item">
                        <div className="message-avatar">
                          {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="message-body">
                          <div className="message-sender">{msg.sender?.name || 'Unknown'}</div>
                          <div className="message-content">{msg.content}</div>
                          <div className="message-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input-area" onSubmit={handleSendMessage}>
                  <input
                    id="message-input"
                    className="form-input"
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder={`Message #${selectedChannel.name}`}
                  />
                  <button
                    id="send-message-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newMsg.trim()}
                  >
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Create New Channel</div>
            <form onSubmit={handleCreateChannel}>
              <div className="form-group">
                <label className="form-label" htmlFor="ch-name">Channel Name *</label>
                <input
                  id="ch-name"
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., general, dev-chat"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ch-desc">Description</label>
                <input
                  id="ch-desc"
                  className="form-input"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="ch-create-submit" type="submit" className="btn btn-primary">Create Channel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
