import React, { useState } from 'react';
import { Calendar, ChevronDown, Clock, MapPin, User, FileText, Send } from 'lucide-react';

export default function AppointmentsPages() {
  const [formData, setFormData] = useState({
    group: '',
    projectTitle: '',
    appointmentDate: '',
    appointmentTime: '',
    location: '',
    description: '',
    appointmentType: 'consultation'
  });

  // Mock data - replace with actual API calls
  const availableGroups = [
    { id: 'P04', name: 'P04 - กลุ่มพัฒนาเว็บแอปพลิเคชัน' },
    { id: 'P05', name: 'P05 - กลุ่มพัฒนาแอปมือถือ' },
    { id: 'P06', name: 'P06 - กลุ่มวิเคราะห์ข้อมูล' }
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'ปรึกษาโครงงาน' },
    { value: 'presentation', label: 'นำเสนอผลงาน' },
    { value: 'progress', label: 'รายงานความคืบหน้า' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  // Mock advisor data based on selected group
  const getAdvisor = (groupId) => {
    const advisors = {
      'P04': { name: 'ผศ.ดร. กิตติศิริ อัตถีรัณ', email: 'kittisiri@university.ac.th' },
      'P05': { name: 'ผศ.ดร. สมชาย วิทยากร', email: 'somchai@university.ac.th' },
      'P06': { name: 'ผศ.ดร. นิภา เทคโนโลยี', email: 'nipha@university.ac.th' }
    };
    return advisors[groupId] || null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  const selectedAdvisor = getAdvisor(formData.group);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">สร้างนัดหมาย</h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">ฟอร์มสร้างนัดหมาย</h2>
                <p className="text-blue-100">กรอกข้อมูลเพื่อนัดหมายกับอาจารย์ที่ปรึกษา</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  กลุ่ม
                </label>
                <div className="relative">
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">เลือกกลุ่มของคุณ</option>
                    {availableGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Advisor Display (Auto-populated) */}
              {selectedAdvisor && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    อาจารย์ที่ปรึกษาประจำกลุ่ม
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedAdvisor.name}</p>
                      <p className="text-sm text-gray-600">{selectedAdvisor.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  ประเภทการนัดหมาย
                </label>
                <div className="relative">
                  <select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {appointmentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Project Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  หัวข้อโปรเจกต์
                </label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  placeholder="กรอกหัวข้อโปรเจกต์ของคุณ"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    วันที่นัดหมาย
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    เวลานัดหมาย
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  สถานที่/ลิงก์ออนไลน์
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="เช่น ห้อง 301 อาคารวิศวกรรม หรือ https://meet.google.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="อธิบายสิ่งที่ต้องการปรึกษาหรือหารือ..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                  <span>ส่งคำขอนัดหมาย</span>
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>หมายเหตุ:</strong> อาจารย์ที่ปรึกษาจะได้รับการแจ้งเตือนและจะตอบกลับภายใน 24 ชั่วโมง
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}