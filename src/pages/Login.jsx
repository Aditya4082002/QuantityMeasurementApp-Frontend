import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { showToast } from '../components/Toast';
import '../styles/auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
      return;
    }

    // Check for OAuth callback
    const token = searchParams.get('token') || searchParams.get('access_token');
    if (token) {
      const name = searchParams.get('name') || 'User';
      const email = searchParams.get('email') || '';
      login(token, name, email);
      showToast(`Welcome back, ${name}! 👋`, 'success', 1200);
      setTimeout(() => navigate('/'), 500);
    }
  }, [user, navigate, searchParams, login]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showToast('Please enter your username and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(username, password);
      login(data.token, username, '');
      showToast(`Welcome back, ${username}! 👋`, 'success', 1200);
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      showToast(error.message || 'Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showToast('Redirecting to Google…', 'info', 1500);
    setTimeout(() => authService.googleLogin(), 400);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      {/* Background Blobs */}
      <div className="blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Login Card */}
      <div className="auth-box glass">
        <div className="auth-header">
          <i className="ph-fill ph-intersect-three"></i>
          <h2>Welcome Back</h2>
          <p>Log in to access your dashboard</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="loginUsername">Username</label>
            <div className="input-wrapper">
              <i className="ph ph-user"></i>
              <input
                type="text"
                id="loginUsername"
                placeholder="your_username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="loginPassword">Password</label>
            <div className="input-wrapper">
              <i className="ph ph-lock-key"></i>
              <input
                type="password"
                id="loginPassword"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Loading…
              </>
            ) : (
              <>
                <i className="ph ph-sign-in"></i> Sign In
              </>
            )}
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="btn-google" onClick={handleGoogleLogin}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
          Continue with Google
        </button>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a className="auth-link" onClick={() => navigate('/signup')} style={{ cursor: 'pointer' }}>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
