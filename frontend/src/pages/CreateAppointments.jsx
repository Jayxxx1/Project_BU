import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createAppointment } from '../services/appointmentService';
import { Calendar, Clock, MapPin, FileText, Send } from 'lucide-react';

/**
 * CreateAppointmentPage
 *
 * หน้าฟอร์มสำหรับสร้างนัดหมายใหม่ โดยใช้ TailwindCSS จัดรูปแบบสวยงามสอดคล้องกับธีมหลัก
 * - มีพื้นหลังเป็นภาพและเบลอ (blur) เพื่อให้ตัวฟอร์มเด่นชัด
 * - ใช้ไอคอนจาก lucide-react ประกอบในส่วนหัวและฟิลด์เพื่อเพิ่มความสวยงาม
 * - ดึง token จาก AuthContext และเรียก createAppointment ผ่าน service
 * - มีการตรวจสอบฟิลด์ที่จำเป็นก่อนส่ง และแสดงข้อความ error ให้ผู้ใช้ทราบ
 */
export default function CreateAppointmentPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingType: 'offline',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่องที่จำเป็น');
      return;
    }
    try {
      setLoading(true);
      await createAppointment(formData, token);
      // หลังสร้างเสร็จ เปลี่ยนไปหน้ารายการนัดหมาย
      navigate('/appointments');
    } catch (err) {
      // แสดงข้อความ error จาก backend หากมี มิฉะนั้นแสดงข้อความทั่วไป
      if (typeof err === 'string') {
        setError(err);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดขณะสร้างนัดหมาย');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url(./bg/bg.webp)] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
      <div className="w-full max-w-2xl backdrop-blur-sm bg-white/70 border border-white/30 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex items-center space-x-4 rounded-t-3xl">
          <div className="bg-white/20 p-3 rounded-full">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">สร้างนัดหมาย</h2>
            <p className="text-blue-100">กรอกข้อมูลเพื่อนัดหมายกับอาจารย์ที่ปรึกษา</p>
          </div>
        </div>
        {/* Form content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                หัวข้อ
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="กรอกหัวข้อนัดหมาย"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                วันที่
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  เวลาเริ่ม
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  เวลาสิ้นสุด
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            {/* Meeting Type */}
            <div>
              <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                ประเภทการประชุม
              </label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="offline">ออฟไลน์</option>
                <option value="online">ออนไลน์</option>
              </select>
            </div>
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                สถานที่ / ลิงก์
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="เช่น ห้อง 301 หรือ https://meet.google.com/..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="อธิบายสิ่งที่ต้องการปรึกษาหรือหารือ..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{loading ? 'กำลังสร้าง...' : 'สร้างนัดหมาย'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}