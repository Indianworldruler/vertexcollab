import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/workspaces', icon: '🏢', label: 'Workspaces' },
  { to: '/channels', icon: '💬', label: 'Channels' },
  { to: '/tasks', icon: '✅', label: 'Tasks' },
  { to: '/documents', icon: '📄', label: 'Documents' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            id={`sidebar-${item.label.toLowerCase()}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {user?.role === 'admin' && (
        <>
          <hr className="sidebar-divider" />
          <div className="sidebar-section">
            <div className="sidebar-section-label">Admin</div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
              id="sidebar-admin"
            >
              <span className="icon">🛡️</span>
              Admin Panel
            </NavLink>
          </div>
        </>
      )}

      <div className="logout-btn">
        <hr className="sidebar-divider" />
        <button
          className="sidebar-link"
          onClick={handleLogout}
          id="sidebar-logout-btn"
          style={{ color: 'var(--color-danger)' }}
        >
          <span className="icon">↩</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
