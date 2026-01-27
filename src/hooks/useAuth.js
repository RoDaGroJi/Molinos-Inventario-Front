/**
 * Hook personalizado para manejo de autenticación
 */

import { useState, useCallback, useEffect } from 'react';
import CONFIG from '../config';
import apiService from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario del localStorage al montar el componente
  useEffect(() => {
    const savedToken = localStorage.getItem(CONFIG.TOKEN_KEY);
    const savedUser = localStorage.getItem(CONFIG.USER_KEY);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(username, password);

      const userData = response.user || { username };

      localStorage.setItem(CONFIG.TOKEN_KEY, response.access_token);
      localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));

      setToken(response.access_token);
      setUser(userData);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.is_admin || false;

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
}
