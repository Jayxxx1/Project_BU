import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((config) => {
  const t =
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;
  if (t) config.headers.Authorization = `Bearer ${String(t).replace(/^"|"$/g, "")}`;
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
