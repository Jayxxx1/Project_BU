import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  const direct =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken');
  if (direct) return direct;
  try {
    const maybe =
      JSON.parse(localStorage.getItem('user') || '{}') ||
      JSON.parse(localStorage.getItem('userInfo') || '{}');
    return maybe?.token || maybe?.accessToken || maybe?.jwt || null;
  } catch { return null; }
}

const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((config) => {
  const t = getToken();
  if (!config.headers) config.headers = {};
  if (t) config.headers.Authorization = `Bearer ${String(t).replace(/^"|"$/g, '')}`;
  return config;
});

export const appointmentService = {
  async create(data) {
    const r = await client.post('/api/appointments', data);
    return r.data;
  },
  async list(params = {}) {
    const r = await client.get('/api/appointments', { params });
    return r.data;
  },
  async get(id) {
    const r = await client.get(`/api/appointments/${id}`);
    return r.data;
  },
  async update(id, data) {
    const r = await client.patch(`/api/appointments/${id}`, data);
    return r.data;
  },
  async remove(id) {
    const r = await client.delete(`/api/appointments/${id}`);
    return r.data;
  },
};

export const getAppointments = (params = {}) => appointmentService.list(params);


