import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";
import { Loader2, CalendarClock, CheckCircle2, Clock, XCircle, RefreshCw, ListChecks, AlertTriangle, Filter, Search } from "lucide-react";

/**
 * MAIN CONTENT (Dashboard)
 * Global overview of ALL appointments (no user filter).
 * Minimal-diff: pure client-side, keeps Tailwind theme used in project.
 */
export default function Maincontent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date"); // date | createdAt

  // Fetch ALL appointments (no params)
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await appointmentService.list();
      setItems(Array.isArray(data) ? data : (data?.appointments || []));
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await fetchAll();
    })();

    // Optional: light auto-refresh every 60s to keep the dashboard fresh
    const t = setInterval(fetchAll, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // Helpers
  const toDate = (it) => {
    // Many of our docs store separate date (YYYY-MM-DD) + startTime (HH:mm)
    const d = it?.date || it?.startDate || it?.scheduledDate; // fallbacks
    const s = it?.startTime || "00:00";
    if (!d) return null;
    // Build local datetime using Asia/Bangkok implicitly (browser local)
    try {
      const [Y, M, D] = d.split("-").map(Number);
      const [h, m] = String(s).split(":").map(Number);
      return new Date(Y, (M || 1) - 1, D || 1, h || 0, m || 0, 0, 0);
    } catch {
      return it?.createdAt ? new Date(it.createdAt) : null;
    }
  };

  const statusLabel = (s) => {
    switch (s) {
      case "pending": return { text: "รอดำเนินการ", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "approved": return { text: "อนุมัติแล้ว", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "reschedule_requested": return { text: "ขอเลื่อนนัด", color: "bg-sky-100 text-sky-800 border-sky-200" };
      case "rejected": return { text: "ถูกปฏิเสธ", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "cancelled": return { text: "ยกเลิก", color: "bg-gray-100 text-gray-600 border-gray-200" };
      case "expired": return { text: "หมดอายุ", color: "bg-neutral-100 text-neutral-700 border-neutral-200" };
      default: return { text: s || "-", color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  // Derived metrics
  const metrics = useMemo(() => {
    const m = {
      total: items.length,
      pending: 0,
      approved: 0,
      reschedule_requested: 0,
      rejected: 0,
      cancelled: 0,
      expired: 0,
      upcomingWithin7d: 0,
    };
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    for (const it of items) {
      const s = it?.status || "";
      if (m[s] !== undefined) m[s]++;
      const dt = toDate(it);
      if (dt && dt >= now && dt <= in7) m.upcomingWithin7d++;
    }
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    let arr = items.slice();
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter((it) =>
        String(it.title || "").toLowerCase().includes(t) ||
        String(it.description || "").toLowerCase().includes(t) ||
        String(it.location || "").toLowerCase().includes(t)
      );
    }
    if (statusFilter !== "all") {
      arr = arr.filter((it) => (it.status || "").toLowerCase() === statusFilter);
    }
    if (sortKey === "date") {
      arr.sort((a, b) => {
        const da = toDate(a)?.getTime() || 0;
        const db = toDate(b)?.getTime() || 0;
        return da - db;
      });
    } else if (sortKey === "createdAt") {
      arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    return arr;
  }, [items, q, statusFilter, sortKey]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return items
      .map((it) => ({ it, dt: toDate(it) }))
      .filter(({ dt }) => dt && dt >= now)
      .sort((a, b) => a.dt - b.dt)
      .slice(0, 5)
      .map(({ it }) => it);
  }, [items]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ภาพรวมการนัดหมายทั้งหมด</h1>
          <p className="text-sm text-slate-500">หน้าแดชบอร์ดสรุป (Global View) — ไม่กรองตามผู้ใช้</p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 shadow hover:bg-slate-800 active:scale-[.98]"
        >
          <RefreshCw className="w-4 h-4" /> รีเฟรช
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={CalendarClock} label="นัดหมายทั้งหมด" value={metrics.total} tone="slate" />
        <MetricCard icon={Clock} label="รอดำเนินการ" value={metrics.pending} tone="amber" />
        <MetricCard icon={CheckCircle2} label="อนุมัติแล้ว" value={metrics.approved} tone="emerald" />
        <MetricCard icon={AlertTriangle} label="ขอเลื่อนภายใน 7 วัน" value={metrics.upcomingWithin7d} tone="sky" subtleNote="กำหนดการภายใน 7 วันข้างหน้า" />
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MiniStat label="ขอเลื่อนนัด" value={metrics.reschedule_requested} tone="sky" />
        <MiniStat label="ถูกปฏิเสธ" value={metrics.rejected} tone="rose" />
        <MiniStat label="ยกเลิก" value={metrics.cancelled} tone="zinc" />
        <MiniStat label="หมดอายุ" value={metrics.expired} tone="neutral" />
        <MiniStat label="ตามวันที่ (sort)" value={sortKey === 'date' ? '✓' : ''} tone="slate" />
        <MiniStat label="ตามวันที่สร้าง (sort)" value={sortKey === 'createdAt' ? '✓' : ''} tone="slate" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหา: ชื่อเรื่อง / สถานที่ / คำอธิบาย"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="reschedule_requested">ขอเลื่อนนัด</option>
              <option value="rejected">ถูกปฏิเสธ</option>
              <option value="cancelled">ยกเลิก</option>
              <option value="expired">หมดอายุ</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white pl-3 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="date">เรียงตามวันนัด</option>
              <option value="createdAt">เรียงตามวันที่สร้าง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upcoming list (Top 5) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><ListChecks className="w-5 h-5"/> กำหนดการที่จะถึง (Top 5)</h2>
          <Link to="/appointments" className="text-sm text-slate-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcoming.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-slate-500">ยังไม่มีกำหนดการในอนาคตอันใกล้</div>
          )}
          {upcoming.map((it) => (
            <UpcomingCard key={it._id || it.id} it={it} toDate={toDate} statusLabel={statusLabel} />
          ))}
        </div>
      </section>

      {/* Data table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarClock className="w-5 h-5"/> รายการนัดหมายทั้งหมด</h2>
          <div className="text-xs text-slate-500">แสดง {filtered.length} / {items.length} รายการ</div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>วัน-เวลา</Th>
                <Th>หัวข้อ</Th>
                <Th className="hidden md:table-cell">สถานที่</Th>
                <Th>สถานะ</Th>
                <Th className="hidden lg:table-cell">ผู้สร้าง</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> กำลังโหลด…</div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">ไม่พบข้อมูลตามที่ค้นหา/กรอง</td>
                </tr>
              )}
              {!loading && !error && filtered.map((it) => (
                <Row key={it._id || it.id} it={it} toDate={toDate} statusLabel={statusLabel} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Small components
function Th({ children, className = "" }) {
  return (
    <th className={`text-left font-medium px-4 py-3 ${className}`}>{children}</th>
  );
}

function MetricCard({ icon: Icon, label, value, tone = "slate", subtleNote }) {
  const toneMap = {
    slate: "bg-slate-50 border-slate-200",
    amber: "bg-amber-50 border-amber-200",
    emerald: "bg-emerald-50 border-emerald-200",
    sky: "bg-sky-50 border-sky-200",
  };
  return (
    <div className={`rounded-2xl border ${toneMap[tone] || toneMap.slate} p-4 shadow-sm`}> 
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
          {subtleNote && <div className="text-[11px] text-slate-400 mt-1">{subtleNote}</div>}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone = "slate" }) {
  const ring = {
    slate: "ring-slate-200",
    sky: "ring-sky-200",
    rose: "ring-rose-200",
    zinc: "ring-zinc-200",
    neutral: "ring-neutral-200",
  }[tone] || "ring-slate-200";
  return (
    <div className={`rounded-2xl bg-white border border-slate-200 p-4 shadow-sm ring-1 ${ring}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function UpcomingCard({ it, toDate, statusLabel }) {
  const dt = toDate(it);
  const s = statusLabel(it.status);
  const dateStr = dt ? dt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-";
  return (
    <Link to={`/appointments/${it._id || it.id}`} className="group block rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium group-hover:underline">{it.title || "(ไม่มีชื่อเรื่อง)"}</div>
          <div className="text-sm text-slate-500">{dateStr}</div>
          {it.location && <div className="text-sm text-slate-500">สถานที่: {it.location}</div>}
        </div>
        <span className={`inline-flex items-center rounded-xl border px-2 py-1 text-xs ${s.color}`}>{s.text}</span>
      </div>
    </Link>
  );
}

function Row({ it, toDate, statusLabel }) {
  const dt = toDate(it);
  const dateStr = dt ? dt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-";
  const s = statusLabel(it.status);
  const creatorName = it?.creator?.fullName || it?.creator?.username || it?.creator?.email || "-";

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/60">
      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{dateStr}</td>
      <td className="px-4 py-3 text-slate-800">
        <div className="font-medium">{it.title || "(ไม่มีชื่อเรื่อง)"}</div>
        {it.description && <div className="text-xs text-slate-500 line-clamp-1">{it.description}</div>}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-slate-700">{it.location || "-"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-xl border px-2 py-1 text-xs ${s.color}`}>{s.text}</span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell text-slate-700">{creatorName}</td>
      <td className="px-4 py-3 text-right">
        <Link to={`/appointments/${it._id || it.id}`} className="text-sm text-slate-700 hover:underline">รายละเอียด</Link>
      </td>
    </tr>
  );
}
