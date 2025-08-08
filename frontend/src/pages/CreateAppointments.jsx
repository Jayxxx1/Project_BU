import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import ConfirmAppointmentModal from "../components/ConfirmAppointmentModal.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";


export default function CreateAppointment() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Toggle file attach
  const [attachEnabled, setAttachEnabled] = useState(false);
  // Form fields
  const [formData, setFormData] = useState({
    group: "",
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    meetingType: "offline",
    location: "",
    note: "",
  });
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Fetch groups (mock data for now)
  useEffect(() => {
    async function fetchGroups() {
      try {
        // TODO: replace with actual API call to fetch user's groups
        const result = [
          {
            id: "P04",
            name: "P04 - กลุ่มพัฒนาเว็บแอปพลิเคชัน",
            projectTitle: "ระบบบันทึกการนัดหมายและการประชุมระหว่างนักศึกษาและอาจารย์",
            advisor: {
              name: "ผศ.ดร. กิตย์ศิริ ",
              email: "example@psu.ac.th",
            },
            members: [
              { id: "67102010416", name: "นายเจษฎา เก็มเบ็นหมาด" },
              { id: "67102010419", name: "นายชินกฤต  กุลวงษ์" },
            ],
          },
          {
            id: "P05",
            name: "P05 - กลุ่มพัฒนาแอปมือถือ",
            projectTitle: "ระบบแอปมือถือ",
            advisor: {
              name: "ผศ.ดร. สมชาย วิทยากร",
              email: "somchai@university.ac.th",
            },
            members: [
              { id: "67102010420", name: "สมาชิกรหัส 20" },
              { id: "67102010421", name: "สมาชิกรหัส 21" },
            ],
          },
        ];
        setGroups(result);
      } catch (err) {
        setGroups([]);
      }
    }
    fetchGroups();
  }, [token]);

 useEffect(() => {
    const group = groups.find((g) => g.id === formData.group);
    setSelectedProjectTitle(group ? group.projectTitle : "");
    setMembers(group ? group.members || [] : []);
  }, [formData.group, groups]);
  // Update selected group and advisor when group changes
  useEffect(() => {
    const group = groups.find((g) => g.id === formData.group);
    setSelectedGroup(group || null);
    setSelectedAdvisor(group ? group.advisor : null);
    setMembers(group ? group.members || [] : []);
  }, [formData.group, groups]);

  // Handle input changes for text/select fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Validate form fields before preview or submit
  const validateForm = () => {
    if (!formData.group) return "กรุณาเลือกกลุ่มของคุณ";
    if (!formData.title) return "กรุณากรอกหัวข้อการนัดหมาย";
    if (!formData.date) return "กรุณากรอกวันที่นัดหมาย";
    if (!formData.startTime || !formData.endTime)
      return "กรุณากรอกเวลานัดหมาย";
    // Additional validations can go here
    return "";
  };

  // Open preview modal if validation passes
  const handlePreview = (e) => {
    e.preventDefault();
    setError("");
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setShowPreview(true);
  };

  // Submit appointment (call API) when user confirms in modal
  // const handleConfirmSubmit = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     // Prepare FormData for file upload
  //     const submitData = new FormData();
  //     Object.entries(formData).forEach(([key, value]) => {
  //       submitData.append(key, value);
  //     });
  //     if (attachEnabled) {
  //       files.forEach((file) => {
  //         submitData.append("files", file);
  //       });
  //     }
  //     // Axios direct call because appointmentService does not support multipart yet
  //     const config = {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };
  //     await axios.post("/api/appointments", submitData, config);
  //     // Show feedback message and redirect after a delay
  //     setShowPreview(false);
  //     setFeedbackMsg(
  //       "ระบบได้ส่งคำขอนัดหมายและอีเมลแจ้งเตือนไปยังอาจารย์แล้ว กรุณารอการยืนยัน"
  //     );
  //     setShowFeedback(true);
  //     setTimeout(() => {
  //       setShowFeedback(false);
  //       navigate("/appointments");
  //     }, 3000);
  //   } catch (err) {
  //     // Extract error message
  //     let msg = "เกิดข้อผิดพลาดขณะสร้างนัดหมาย";
  //     if (typeof err === "string") msg = err;
  //     else if (err?.response?.data?.message) msg = err.response.data.message;
  //     else if (err?.message) msg = err.message;
  //     setError(msg);
  //   } finally {
  //     setLoading(false);
  //   }

  const handleConfirmSubmit = () => {
  setLoading(true);
  setError("");
  setShowPreview(false);
  setFeedbackMsg(
    "ระบบได้ส่งคำขอนัดหมายและอีเมลแจ้งเตือนไปยังอาจารย์แล้ว กรุณารอการยืนยัน"
  );
  setShowFeedback(true);
  setTimeout(() => {
    setShowFeedback(false);
    navigate("/appointments");
  }, 3000);
  setLoading(false);
}
  return (

    <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center bg-no-repeat relative">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>
      <div className="relative z-10 max-w-5xl w-full mx-auto px-2 sm:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-2xl px-8 py-6 mb-0 shadow-xl">
          <h2 className="text-2xl font-medium">สร้างนัดหมายใหม่</h2>
        </div>
        <form
          onSubmit={handlePreview}
          className="bg-white rounded-b-2xl shadow-xl px-8 py-7 space-y-6"
        >
          {/* Error message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
          {/* Group Select */}
          <div>
            <label className="block font-semibold mb-3 text-gray-700 text-base md:text-lg">
              กลุ่มของคุณ
            </label>
            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
              required
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="">เลือกกลุ่ม</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Advisor Info */}
          {selectedAdvisor && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-1">
              <p className="font-medium text-gray-800">
                อาจารย์ที่ปรึกษา: {selectedAdvisor.name}
              </p>
              <p className="text-sm text-gray-600">{selectedAdvisor.email}</p>
            </div>
          )}
          {selectedProjectTitle && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-1">
              <p className="font-medium text-gray-800">
                ชื่อโปรเจกต์: {selectedProjectTitle}
              </p>
            </div>
          )}
          {/* Title */}
          <div>
            <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" /> หัวข้อ
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="หัวข้อการนัดหมาย"
              className="w-full border p-3 rounded-xl"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" /> รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="รายละเอียด (ถ้ามี)"
              className="w-full border p-4 rounded-xl"
            />
          </div>
          {/* Date & Time */}
          <label className="block font-semibold text-gray-700 mb-1 text-base md:text-lg">วันที่ / เวลา</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border p-3 rounded-xl"
            />
            <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
              <div>
            <label className="block text-base md:text-lg font-semibold text-gray-700 mb-1">
                  เริ่มต้น
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="border p-3 rounded-xl"
                />
              </div>
              <div>
            <label className="block text-base md:text-lg font-semibold text-gray-700 mb-1">
                  สิ้นสุด
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="border p-3 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-base md:text-lg">
              ประเภทการประชุม
            </label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl"
            >
              <option value="offline">ประชุมที่ห้อง/สถานที่</option>
              <option value="online">ประชุมออนไลน์</option>
            </select>
          </div>
          {/* Location */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-base md:text-lg">
              สถานที่ / ลิงก์
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="สถานที่ / ลิงก์"
              className="w-full border p-3 rounded-xl"
            />
          </div>
          {/* Note */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-base md:text-lg">หมายเหตุ (ถ้ามี)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับนัดหมาย"
              className="w-full border p-3 rounded-xl"
            />
          </div>
          {/* Attachment toggle */}
          <div className="flex items-center mb-2">
            <input
              id="attachToggle"
              type="checkbox"
              checked={attachEnabled}
              onChange={(e) => setAttachEnabled(e.target.checked)}
              className="mr-2 accent-blue-500"
            />
            <label htmlFor="attachToggle" className="text-sm text-gray-700">
              มีไฟล์แนบหรือไม่
            </label>
          </div>
          {/* File inputs */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 text-base md:text-lg">
              แนบไฟล์ (ได้มากกว่า 1 ไฟล์)
            </label>
            <input
              type="file"
              multiple
              disabled={!attachEnabled}
              onChange={handleFileChange}
              className={`block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                ${!attachEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                ไฟล์ที่เลือก: {files.map((f) => f.name).join(', ')}
              </div>
            )}
          </div>
          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow hover:from-blue-600 hover:to-blue-700 transition duration-200"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบข้อมูล'}
          </button>
        </form>
      </div>
      {/* Preview Modal */}
      <ConfirmAppointmentModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        files={files}
        groupInfo={selectedGroup}
        members={members}
        advisor={selectedAdvisor}
        loading={loading}
        projectTitle={selectedProjectTitle}
      />
      {/* Feedback Modal */}
      <FeedbackModal
        open={showFeedback}
        message={feedbackMsg}
        onClose={() => setShowFeedback(false)}
        autoClose={0}
      />
    </div>
  );
}
