import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    academicYear: "",
    advisorId: "",
    files: [],
  });

  // ดึงข้อมูลผู้ใช้ปัจจุบันจาก context เพื่อใช้ตรวจสอบสิทธิ์แก้ไขโปรเจค
  const { user, role } = useAuth();

  useEffect(() => {
    (async () => {
      const data = await projectService.get(id);
      setProject(data);
      setForm({
        name: data.name,
        description: data.description || "",
        academicYear: data.academicYear || "",
        advisorId: data.advisor?._id || "",
        files: data.files || [],
      });
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await projectService.update(id, {
      name: form.name,
      description: form.description,
      advisorId: form.advisorId,
      files: form.files,
    });
    setEditMode(false);
    const updated = await projectService.get(id);
    setProject(updated);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-lg font-medium text-gray-700">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  // ตรวจสอบว่าผู้ใช้สามารถแก้ไขโปรเจคนี้ได้หรือไม่ (ผู้สร้างหรือ admin)
  const canEdit = !!user && (role === 'admin' || (project.createdBy && project.createdBy._id === user._id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="project-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
              <rect x="8" y="8" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#project-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {!editMode ? (
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold">{project.name}</h2>
                    </div>
                  </div>
                  
                  {canEdit && (
                    <button
                      className="bg-cyan-500 shadow-xl shadow-cyan-500/50 hover:bg-cyan-400 hover:shadow-cyan-400/50 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-sm flex items-center space-x-2 transform hover:scale-105"
                      onClick={() => setEditMode(true)}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      <span>แก้ไขโปรเจ็กต์</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Project Info Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                  ข้อมูลโปรเจ็กต์
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">รายละเอียด:</p>
                    <p className="text-gray-800">{project.description || "—"}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">ปีการศึกษา:</p>
                    <p className="text-gray-800 font-semibold">{project.academicYear}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">อาจารย์ที่ปรึกษา:</p>
                    <p className="text-gray-800 font-semibold">{project.advisor?.fullName || project.advisor?.email}</p>
                  </div>
                </div>
              </div>

              {/* Members Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  สมาชิก
                </h3>
                
                <div className="space-y-3">
                  {project.members.map((member, index) => (
                    <div 
                      key={member._id}
                      className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 transform hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">
                        {member.fullName || member.username || member.email}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // แบบฟอร์มแก้ไข
          canEdit ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    แก้ไขโปรเจ็กต์
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อโปรเจ็กต์</label>
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="กรอกชื่อโปรเจ็กต์"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียด</label>
                    <textarea 
                      name="description" 
                      value={form.description} 
                      onChange={handleChange} 
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="กรอกรายละเอียดโปรเจ็กต์"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ปีการศึกษา</label>
                    <input 
                      name="academicYear" 
                      value={form.academicYear} 
                      onChange={handleChange} 
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                      <span>บันทึก</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                      onClick={() => setEditMode(false)}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                      <span>ยกเลิก</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-red-50/80 backdrop-blur-lg border border-red-200 p-6 rounded-2xl shadow-xl text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">ไม่มีสิทธิ์แก้ไข</h3>
                <p className="text-red-600">คุณไม่มีสิทธิ์แก้ไขโปรเจคนี้</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}