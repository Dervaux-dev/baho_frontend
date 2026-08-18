import { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './styles.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('nb_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('nb_user') || 'null'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/login`, { email, password });
    if (res.data && res.data.success) {
      const { token: t, data: u } = res.data;
      setToken(t);
      setUser(u);
      localStorage.setItem('nb_token', t);
      localStorage.setItem('nb_user', JSON.stringify(u));
    }
  };

  const handleRegister = async (name, email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/register`, { name, email, password });
    if (res.data && res.data.success) {
      const { token: t, data: u } = res.data;
      setToken(t);
      setUser(u);
      localStorage.setItem('nb_token', t);
      localStorage.setItem('nb_user', JSON.stringify(u));
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nb_token');
    localStorage.removeItem('nb_user');
    delete axios.defaults.headers.common.Authorization;
  };

  if (!token) {
    return <LandingPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
