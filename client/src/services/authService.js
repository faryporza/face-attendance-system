import api from './api';

export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  const token = res.data.token;
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return res.data;
};

export const loginWithFetch = async (credentials) => {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};
