import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mekongpos_token'));
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const storedToken = localStorage.getItem('mekongpos_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user || res.data.data || res.data);
      setToken(storedToken);
    } catch {
      localStorage.removeItem('mekongpos_token');
      localStorage.removeItem('mekongpos_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const responseData = res.data;
    const newToken = responseData.data.token;
    const newUser = responseData.data.user;
    localStorage.setItem('mekongpos_token', newToken);
    localStorage.setItem('mekongpos_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('mekongpos_token');
    localStorage.removeItem('mekongpos_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAdmin = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin, isCashier }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
