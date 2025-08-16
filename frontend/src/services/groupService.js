import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((config) => {
  const t = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;
  if (t) config.headers.Authorization = `Bearer ${String(t).replace(/^"|"$/g, '')}`;
  return config;
});

export const groupService = {
  async create({ name, description, advisorId, memberIds = [] }) {
    const r = await client.post('/api/groups', { name, description, advisorId, memberIds });
    return r.data;
  },
  async listMine() {
    const r = await client.get('/api/groups/mine');
    return r.data;
  },
  async update(id, payload) {
    const r = await client.patch(`/api/groups/${id}`, payload);
    return r.data;
  },
  async remove(id) {
    const r = await client.delete(`/api/groups/${id}`);
    return r.data;
  },
};
