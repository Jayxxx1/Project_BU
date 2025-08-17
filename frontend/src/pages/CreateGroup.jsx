import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { teacherService } from "../services/teacherService";
import { groupService } from "../services/groupService";
import FeedbackModal from "../components/FeedbackModal.jsx";
import { Users, GraduationCap, PlusCircle } from "lucide-react";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupNumber, setGroupNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState("");

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [userSuggestions, setUserSuggestions] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Function to get the current user's ID from localStorage
  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user?._id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Set the current user's ID on component mount
    setCurrentUserId(getCurrentUserId());
  }, []);

  const handleSearchUsers = async (q) => {
    if (q.trim().length < 2) {
      setUserSuggestions([]);
      return;
    }
    // Pass the current user's ID to the search function to exclude themselves
    const results = await groupService.searchUsers({ q, role: 'student', excludeIds: currentUserId ? [currentUserId] : [] });
    setUserSuggestions(results);
  };

  const addMember = (u) => {
    if (!selectedMembers.some(member => member._id === u._id)) {
      setSelectedMembers((prev) => [...prev, u]);
    }
    setUserSuggestions([]);
    setUserSearchTerm("");
  };

  const removeMember = (uid) => {
    setSelectedMembers((prev) => prev.filter((member) => member._id !== uid));
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingTeachers(true);
        const data = await teacherService.list(q.trim());
        if (!alive) return;
        setTeachers(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setTeachers([]);
      } finally {
        if (alive) setLoadingTeachers(false);
      }
    })();
    return () => { alive = false; };
  }, [q]);

  const canSubmit = useMemo(() => name.trim() && advisorId && !loading, [name, advisorId, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await groupService.create({
        groupNumber: groupNumber.trim(),
        name: name.trim(),
        description: description.trim(),
        advisorId,
        memberIds: selectedMembers.map(m => m._id),
      });
      setFeedbackMsg("สร้างกลุ่มสำเร็จ");
      setShowFeedback(true);
      setTimeout(() => navigate("/groups"), 900);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "สร้างกลุ่มไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>

      <div className="relative z-10 max-w-3xl w-full mx-auto px-2 sm:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-2xl px-8 py-6 shadow-xl">
          <h2 className="text-2xl font-medium">สร้างกลุ่มใหม่</h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl px-8 py-7 space-y-6">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
          {/* Group Number */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 text-base md:text-lg">
              หมายเลขกลุ่ม
            </label>
            <input
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              placeholder="เช่น 01"
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          {/* Group Name */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 text-base md:text-lg">
              ชื่อกลุ่ม <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น กลุ่มระบบนัดหมายอัจฉริยะ"
              required
              maxLength={120}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          {/* Add Members */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 text-base md:text-lg">
              เพิ่มสมาชิก (นักศึกษา)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหานักศึกษาด้วยชื่อหรืออีเมล..."
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  if (e.target.value.trim().length > 1) {
                    handleSearchUsers(e.target.value);
                  } else {
                    setUserSuggestions([]);
                  }
                }}
              />
              {userSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {userSuggestions.map((user) => (
                    <li
                      key={user._id}
                      className="p-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => addMember(user)}
                    >
                      <div>
                        <span className="font-medium">{user.username || user.email}</span>
                        <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                      </div>
                      <PlusCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">สมาชิกในกลุ่ม ({selectedMembers.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member._id}
                    className="bg-gray-100 text-gray-700 rounded-full px-4 py-2 flex items-center gap-2"
                  >
                    <span>{member.username || member.email}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeMember(member._id)}
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Description */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 text-base md:text-lg">คำอธิบาย</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="รายละเอียด/ขอบเขตของโปรเจกต์โดยย่อ"
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          {/* Advisor */}
          <div>
            <div className="flex items-end justify-between gap-3">
              <label className="block font-semibold text-gray-700 text-base md:text-lg">
                เลือกอาจารย์ที่ปรึกษา <span className="text-red-500">*</span>
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาอาจารย์..."
                className="w-48 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
              />
            </div>
            <div className="mt-2">
              <select
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                required
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="">{loadingTeachers ? "กำลังโหลด..." : "— เลือกอาจารย์ —"}</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {(t.username || t.email)} ({t.email})
                  </option>
                ))}
              </select>
              {!loadingTeachers && teachers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">ไม่พบอาจารย์ที่ตรงกับคำค้น</p>
              )}
            </div>
          </div>



          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/groups"
              className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              ย้อนกลับ
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition
                ${canSubmit
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"}`}
            >
              {loading ? "กำลังบันทึก..." : "สร้างกลุ่ม"}
            </button>
          </div>
        </form>

        <FeedbackModal
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          message={feedbackMsg}
        />
      </div>
    </div>
  );
}
