import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { groupService } from "../services/groupService";
import { Users, GraduationCap, Calendar as Cal, PlusCircle, Trash2, Pencil } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await groupService.listMine();
        if (!alive) return;
        setGroups(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
    } catch { return "-"; }
  };

  const statusGrad = (s) => {
    switch ((s || "active").toLowerCase()) {
      case "archived": return "from-gray-400 to-gray-500";
      default:         return "from-green-500 to-emerald-500";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันลบกลุ่มนี้?")) return;
    try {
      await groupService.remove(id);
      setGroups((prev) => prev.filter((g) => g._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/bg/bg.webp')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs"></div>
        <div className="relative z-10 bg-white/95 rounded-2xl shadow-2xl px-8 py-6">
          กำลังโหลด...
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
            <h2 className="text-2xl font-medium">กลุ่มของคุณ</h2>
            <Link
              to="/groups/create"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl"
            >
              <PlusCircle className="w-5 h-5" /> สร้างกลุ่มใหม่
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white rounded-b-2xl shadow-xl px-8 py-7">
          {err && (
            <div className="mb-6 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {err}
            </div>
          )}

          {groups.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <div className="mx-auto w-full max-w-md bg-white/95 rounded-2xl border border-gray-200/60 shadow-xl p-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <Users className="w-14 h-14 text-gray-300 mx-auto relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">ยังไม่มีกลุ่ม</h3>
                <p className="text-gray-600 mb-6">เริ่มต้นสร้างกลุ่มเพื่อเชื่อมกับการนัดหมายและที่ปรึกษา</p>
                <Link
                  to="/groups/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  <PlusCircle className="w-5 h-5" /> สร้างกลุ่มใหม่
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">จำนวนทั้งหมด {groups.length} กลุ่ม</div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((g) => (
                  <div key={g._id} className="group bg-white/95 rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${statusGrad(g.status)}`}></div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{g.name}</h3>

                      <div className="flex items-center text-gray-600 mb-2">
                        <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{g?.advisor?.username || g?.advisor?.email || "—"}</span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-2">
                        <Users className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>{(g?.members || []).length} สมาชิก</span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <Cal className="w-4 h-4 mr-2 text-purple-500" />
                        <span>สร้างเมื่อ {fmtDate(g.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Link
                          to="/appointments/create"
                          state={{ groupId: g._id }}
                          className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-500 hover:to-purple-500 hover:text-white transition"
                        >
                          นัดหมายกับกลุ่มนี้
                        </Link>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert('หน้าแก้ไขยังไม่เปิดใช้งาน')}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                            title="แก้ไข"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(g._id)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-red-600 transition"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
