
import axios from 'axios';
const API_URL = '/api/appointments';

// สร้างนัดหมายใหม่
export const createAppointment = async (data, token) => {
  const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, data, config);
  return response.data;
};

// ดึงนัดหมายของผู้ใช้งาน
export const getMyAppointments = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// ดึงนัดหมายตาม ID
export const getAppointmentById = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

// อัปเดตนัดหมาย
export const updateAppointment = async (id, data, token) => {
  const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}`, data, config);
  return response.data;
};

// ลบนัดหมาย
export const deleteAppointment = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};