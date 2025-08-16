import React, { useEffect, useMemo, useState } from "react";
import { adminService } from "../services/adminService";
import { Users, Shield, PlusCircle, Search, Mail, User as UserIcon, Lock } from "lucide-react";

export default function AdminUsersPage() {
  // ---- (ช่องทางเข้าเฉพาะแอดมิน) ----------
  const requirePin = (import.meta.env.VITE_REQUIRE_ADMIN_PIN || "0") === "1";
  const ADMIN_PIN   = import.meta.env.VITE_ADMIN_PIN || "";
  const [pinInput, setPinInput] = useState("");
  const [unlocked, setUnlocked] = useState(!requirePin || sessionStorage.getItem("adminUnlocked") === "1");
  const [pinError, setPinError] = useState("");

  const submitPin = (e) => {
    e.preventDefault();
    if (!requirePin) { setUnlocked(true); return; }
    if (pinInput && ADMIN_PIN && pinInput === ADMIN_PIN) {
      sessionStorage.setItem("adminUnlocked", "1");
      setUnlocked(true);
      setPinError("");
    } else {
      setPinError("รหัสไม่ถูกต้อง");
    }
  };

  // ---------- Admin data ----------
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState("");           // 401/403
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const canCreate = useMemo(() => {
    return form.username.trim() && form.email.trim() && form.password.length >= 6;
  }, [form]);

  const load = async () => {
    setLoading(true);
    setErr("");
    setAuthErr("");
    try {
      const list = await adminService.listTeachers(q.trim());
      setTeachers(Array.isArray(list) ? list : []);
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401 || code === 403) setAuthErr("อนุญาตเฉพาะผู้ดูแลระบบเท่านั้น");
      else setErr(e?.response?.data?.message || e?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (unlocked) load(); }, [unlocked, q]);

  const createTeacher = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    try {
      const t = await adminService.createTeacher(form);
      setTeachers((prev) => [t, ...prev]);
      setForm({ username: "", email: "", password: "" });
      alert("เพิ่มอาจารย์สำเร็จ");
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "เพิ่มอาจารย์ไม่สำเร็จ");
    }
  };

  if (!unlocked) {
    // --------- PIN Gate UI ----------
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-2xl px-8 py-6 shadow-xl">
            <h2 className="text-2xl font-medium flex items-center gap-2">
              <Shield className="w-6 h-6" /> เข้าสู่พื้นที่ผู้ดูแลระบบ
            </h2>
          </div>
          <form onSubmit={submitPin} className="bg-white rounded-b-2xl shadow-xl px-8 py-7 space-y-5">
            <label className="block font-semibold mb-1 text-gray-700">รหัสเฉพาะแอดมิน</label>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="ใส่รหัส"
                className="flex-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            {pinError && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">{pinError}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              เข้าสู่ระบบแอดมิน
            </button>
            <p className="text-xs text-gray-500">
              * เพื่อความปลอดภัย ที่แท้จริงเซิร์ฟเวอร์จะตรวจสิทธิ์ role=admin อยู่แล้ว
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>
        <div className="relative z-10 bg-white/95 rounded-2xl shadow-2xl px-8 py-6">กำลังโหลด...</div>
      </div>
    );
  }

  if (authErr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>
        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-t-2xl px-8 py-6 shadow-xl">
            <h2 className="text-2xl font-medium">ปฏิเสธการเข้าถึง</h2>
          </div>
          <div className="bg-white rounded-b-2xl shadow-xl px-8 py-7">
            เฉพาะผู้ใช้ที่มีสิทธิ์ <b>admin</b> เท่านั้น
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-2 sm:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-2xl px-8 py-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium flex items-center gap-2">
              <Users className="w-6 h-6" /> จัดการผู้ใช้ (เฉพาะแอดมิน)
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white rounded-b-2xl shadow-xl px-8 py-7 space-y-8">
          {err && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">{err}</div>
          )}

          {/* Add Teacher */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" /> เพิ่มอาจารย์
            </h3>
            <form onSubmit={createTeacher} className="grid gap-4 sm:grid-cols-3">
              <div className="col-span-1">
                <label className="text-sm text-gray-600 mb-1 block">ชื่อผู้ใช้</label>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="เช่น somchai.t"
                    className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="text-sm text-gray-600 mb-1 block">อีเมล</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="teacher@university.ac.th"
                    className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="text-sm text-gray-600 mb-1 block">รหัสผ่าน (อย่างน้อย 6 ตัว)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••"
                  minLength={6}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div className="col-span-full flex justify-end">
                <button
                  type="submit"
                  disabled={!canCreate}
                  className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
                    canCreate
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  เพิ่มอาจารย์
                </button>
              </div>
            </form>
          </div>

          {/* Search + List */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาอาจารย์ (ชื่อ/อีเมล)"
                className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div className="text-gray-600">ทั้งหมด {teachers.length} คน</div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => (
              <div key={t._id} className="bg-white/95 rounded-2xl shadow-xl border border-gray-200/60 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-blue-50">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{t.username || "-"}</div>
                    <div className="text-gray-600 text-sm">{t.email}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">role: <span className="uppercase">{t.role || "teacher"}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
