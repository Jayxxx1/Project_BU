import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createAppointment } from '../services/appointmentService';


export default function CreateAppointmentPage() {
  const { user,token } = useAuth();
  // const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', date: '', startTime: '', endTime: '', meetingType: 'offline', location: '' });
  const [error, setError] = useState('');

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  // console.log('Token in page:', token);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    try {
      await createAppointment(formData, token);
      navigate('/appointments');
      console.log('>>> token is', token);
    } catch (err) {
      setError(err.response?.data.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl mb-4">สร้างนัดหมายใหม่</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ฟิลด์หัวข้อ วัน เวลา รายละเอียด ประเภท สถานที่ */}
        <input name="title" placeholder="หัวข้อ" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border p-2 rounded" />
        <div className="flex space-x-2">
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="border p-2 rounded" />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="border p-2 rounded" />
        </div>
        <textarea name="description" placeholder="รายละเอียด" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />
        <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
        <input name="location" placeholder="สถานที่ / ลิงก์" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">บันทึก</button>
      </form>
    </div>
  );
}