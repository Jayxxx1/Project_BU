import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((config) => {
  const t = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;
  if (t) config.headers.Authorization = `Bearer ${String(t).replace(/^"|"$/g, '')}`;
  return config;
});

export const teacherService = {
  async list(q = '') {
    const r = await client.get('/api/teachers', { params: q ? { q } : {} });
    return r.data; // [{_id, username, email}]
  },
};
