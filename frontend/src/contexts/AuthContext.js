import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('rokugan_token'));
  const [loading, setLoading] = useState(true);

  const authAxios = useCallback(() => {
    const instance = axios.create({ baseURL: API });
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return instance;
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { setUser(res.data); setLoading(false); })
        .catch(() => { localStorage.removeItem('rokugan_token'); setToken(null); setUser(null); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post(`${API}/auth/login`, { username, password });
    localStorage.setItem('rokugan_token', res.data.token);
    setToken(res.data.token);
    setUser({ user_id: res.data.user_id, username: res.data.username });
    return res.data;
  };

  const register = async (username, password) => {
    const res = await axios.post(`${API}/auth/register`, { username, password });
    localStorage.setItem('rokugan_token', res.data.token);
    setToken(res.data.token);
    setUser({ user_id: res.data.user_id, username: res.data.username });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('rokugan_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
}
