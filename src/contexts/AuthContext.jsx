import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem('qma-token');
    const name = sessionStorage.getItem('qma-name');
    const email = sessionStorage.getItem('qma-email');

    if (token) {
      setUser({ name: name || 'User', email: email || '', token });
    }
    setLoading(false);
  }, []);

  const login = (token, name, email) => {
    sessionStorage.setItem('qma-token', token);
    sessionStorage.setItem('qma-name', name);
    sessionStorage.setItem('qma-email', email);
    setUser({ name, email, token });
  };

  const logout = () => {
    sessionStorage.removeItem('qma-token');
    sessionStorage.removeItem('qma-name');
    sessionStorage.removeItem('qma-email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
