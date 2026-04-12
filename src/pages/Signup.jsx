import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { showToast } from '../components/Toast';
import '../styles/auth.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup(username, password);
      if (typeof data === 'string' && data.toLowerCase().includes('already')) {
        showToast(data, 'warn');
      } else {
        showToast('Account created! Redirecting to login…', 'success', 1500);
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (error) {
      showToast(error.message || 'Signup failed.', 'error');
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

      {/* Signup Card */}
      <div className="auth-box glass">
        <div className="auth-header">
          <i className="ph-fill ph-intersect-three"></i>
          <h2>Create Account</h2>
          <p>Join QMA for advanced conversions</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="signupUsername">Username</label>
            <div className="input-wrapper">
              <i className="ph ph-user"></i>
              <input
                type="text"
                id="signupUsername"
                placeholder="choose_a_username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="signupPassword">Password</label>
            <div className="input-wrapper">
              <i className="ph ph-lock-key"></i>
              <input
                type="password"
                id="signupPassword"
                placeholder="••••••••"
                autoComplete="new-password"
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
                <i className="ph ph-user-plus"></i> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="btn-google" onClick={handleGoogleLogin}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
          Sign up with Google
        </button>

        <div className="auth-footer">
          Already have an account?{' '}
          <a className="auth-link" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
            Log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
