import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;           
const API_URL = `${BASE}/api/auth/`;

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}register`, userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    // ดึงข้อความจาก response.data.message ให้หมดจด
    const serverMessage = error.response?.data?.message;
    // กรณี validator ของ mongoose
    let msg = serverMessage || 'เกิดข้อผิดพลาดในการลงทะเบียน';
    if (msg.includes('Path `password`')) {
      msg = 'รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร';
    }
    // **โยนเป็น string ทีเดียว**
    throw msg;
  }
};

const login = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const serverMessage = error.response?.data?.message;
    let msg = serverMessage || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    if (
      msg.includes('กรุณากรอกอีเมล') ||
      msg.includes('ไม่ถูกต้อง') ||
      msg.includes('Path `email`') ||
      msg.includes('Path `password`')
    ) {
      msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
    }
    throw msg;
  }
};

export default {
  register,
  login,
};
