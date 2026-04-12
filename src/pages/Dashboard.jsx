import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';
import Calculator from '../components/Calculator';
import History from '../components/History';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('calculator');

  const getUserInitials = () => {
    return user?.name?.charAt(0).toUpperCase() || 'G';
  };

  const handleHistoryClick = () => {
    if (!user) {
      showToast('Please login to view history', 'warn');
      navigate('/login');
      return;
    }
    setActiveView('history');
  };

  const handleLogout = () => {
    logout();
    setActiveView('calculator'); // Stay on dashboard after logout
    showToast('Logged out successfully', 'success');
  };

  return (
    <div className="app-container">
      {/* Background Blobs */}
      <div className="blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo">
          <i className="ph-fill ph-intersect-three"></i>
          <span>QMA</span>
        </div>

        <ul className="nav-menu">
          <li
            className={`nav-item ${activeView === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveView('calculator')}
          >
            <i className="ph ph-squares-four"></i>
            <span>Dashboard</span>
          </li>
          <li
            className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
            onClick={handleHistoryClick}
          >
            <i className="ph ph-clock-counter-clockwise"></i>
            <span>History</span>
          </li>
          
          {user ? (
            <li className="nav-item logout-btn" onClick={handleLogout}>
              <i className="ph ph-sign-out"></i>
              <span>Logout</span>
            </li>
          ) : null}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header glass">
          <h1 className="page-title">
            {activeView === 'calculator' ? 'Measurement Engine' : 'Operation History'}
          </h1>
          <div className="header-actions">
            {user ? (
              <div className="user-profile">
                <div className="user-info">
                  <span className="user-name">{user.name || 'User'}</span>
                  <span className="user-email">{user.email || ''}</span>
                </div>
                <div className="avatar">{getUserInitials()}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.9rem',
                    border: '2px solid var(--accent-color)',
                    background: 'transparent',
                    color: 'var(--accent-color)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--accent-color)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--accent-color)';
                  }}
                >
                  <i className="ph ph-sign-in"></i> Login
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/signup')}
                  style={{
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.9rem'
                  }}
                >
                  <i className="ph ph-user-plus"></i> Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Views */}
        {activeView === 'calculator' ? <Calculator /> : <History />}
      </main>
    </div>
  );
};

export default Dashboard;
