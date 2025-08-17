import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export const adminService = {
  async createTeacher({ username, email, password }) {
    const r = await client.post("/api/admin/teachers", { username, email, password });
    return r.data; // {_id, username, email, role}
  },
  async listTeachers(q = "") {
    const r = await client.get("/api/admin/teachers", { params: q ? { q } : {} });
    return r.data; // [{_id, username, email, role}]
  },
  async setRole(userId, role) {
    const r = await client.patch(`/api/admin/users/${userId}/role`, { role });
    return r.data;
  },
};
