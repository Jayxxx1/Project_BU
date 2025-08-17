import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch { return null; }
}

const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const groupService = {
  async create({ groupNumber, name, description, advisorId, memberIds = [] }) {
    const r = await client.post('/api/groups', { groupNumber, name, description, advisorId, memberIds });
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
  async searchUsers({ q = '', role = 'student', excludeGroup, excludeIds = [], limit = 10 } = {}) {
    const params = {};
    if (q) params.q = q;
    if (role) params.role = role;
    if (excludeGroup) params.excludeGroup = excludeGroup;
    if (limit) params.limit = limit;
    if (excludeIds.length) params.excludeIds = excludeIds.join(',');
    const r = await client.get('/api/groups/search-users', { params });
    return r.data;
  },
  async addMembers(id, memberIds = []) {
    const r = await client.patch(`/api/groups/${id}/members/add`, { memberIds });
    return r.data;
  },
  async removeMembers(id, memberIds = []) {
    const r = await client.patch(`/api/groups/${id}/members/remove`, { memberIds });
    return r.data;
  },
};
