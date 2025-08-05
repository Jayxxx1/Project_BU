import axios from 'axios';
const API_URL = '/api/appointments';

// สร้างนัดหมายใหม่
export const createAppointment = async (data, token) => {
  try {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, data, config);
    return response.data;
  } catch (err) {
    throw err?.response?.data?.message || 'เกิดข้อผิดพลาดขณะสร้างนัดหมาย';
  }
};

// ดึงนัดหมายของผู้ใช้งาน
export const getAppointments = async (token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (err) {
    throw err?.response?.data?.message || 'เกิดข้อผิดพลาดขณะดึงนัดหมาย';
  }
};

// ดึงนัดหมายตาม ID
export const getAppointmentById = async (id, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
  } catch (err) {
    throw err?.response?.data?.message || 'เกิดข้อผิดพลาดขณะดึงข้อมูลนัดหมาย';
  }
};

// อัปเดตนัดหมาย
export const updateAppointment = async (id, data, token) => {
  try {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, data, config);
    return response.data;
  } catch (err) {
    throw err?.response?.data?.message || 'เกิดข้อผิดพลาดขณะอัปเดตนัดหมาย';
  }
};

// ลบนัดหมาย
export const deleteAppointment = async (id, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (err) {
    throw err?.response?.data?.message || 'เกิดข้อผิดพลาดขณะลบนัดหมาย';
  }
};
