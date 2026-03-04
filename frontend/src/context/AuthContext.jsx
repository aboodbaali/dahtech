// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dahtech_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('dahtech_user'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (usernameInput, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login(usernameInput, password);
      localStorage.setItem('dahtech_token', data.token);
      localStorage.setItem('dahtech_user', data.username);
      setToken(data.token);
      setUsername(data.username);
      return true;
    } catch (err) {
      setError('Invalid username or password');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dahtech_token');
    localStorage.removeItem('dahtech_user');
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, username, loading, error,
      isAuthenticated: !!token,
      login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
