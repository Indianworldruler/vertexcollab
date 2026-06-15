import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        ⬡ <span>Vertex<b style={{ color: 'var(--color-primary)' }}>Collab</b></span>
      </Link>

      <div className="navbar-right">
        {user && (
          <>
            <div className="user-badge">
              <div className="user-avatar">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span>{user.name}</span>
              <span className={`role-chip ${user.role}`}>{user.role}</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              id="navbar-logout-btn"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
