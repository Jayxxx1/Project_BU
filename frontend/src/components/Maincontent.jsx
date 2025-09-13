import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ปรับให้ตรงกับโปรเจกต์คุณ
import { appointmentService } from '../services/appointmentService';
import { userService } from '../services/userService';
<<<<<<< HEAD
import { useAuth } from '../contexts/AuthContext.jsx';
=======
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374

export default function MainContent() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);      
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  const [usersCount, setUsersCount] = useState(0);

<<<<<<< HEAD
  // Current authenticated user.  Use this to decide which
  // appointments endpoint to call (mine vs all).
  const { user } = useAuth();

=======
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
  // ---------- Helpers ----------
  const toDateObj = (appt) => {
    // ใช้ startAt เป็นหลัก ถ้าไม่มี fallback เป็น date + startTime
    if (appt?.startAt) return new Date(appt.startAt);
    if (appt?.date && appt?.startTime) return new Date(`${appt.date}T${appt.startTime}:00`);
    return null;
  };

  const formatThaiDateTime = (d) =>
    d ? d.toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' }) : '-';

  // เช็คว่าอยู่ "วันนี้" ในโซนเวลา Bangkok (ไม่สนวินาที)
  const isTodayBangkok = (d) => {
    if (!d) return false;
    const tz = 'Asia/Bangkok';
    const now = new Date();

    const ymd = (x) =>
      new Intl.DateTimeFormat('th-TH', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
        .format(x);

    return ymd(d) === ymd(now);
  };

  const getStatusProps = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'approved':
      case 'confirmed':
        return { bg: 'bg-green-100', color: 'text-green-800', label: 'อนุมัติแล้ว', dot: 'bg-green-500' };
      case 'cancelled':
        return { bg: 'bg-red-100', color: 'text-red-800', label: 'ยกเลิกแล้ว', dot: 'bg-red-500' };
      case 'rejected':
        return { bg: 'bg-red-100', color: 'text-red-800', label: 'ปฏิเสธแล้ว', dot: 'bg-red-500' };
      case 'reschedule_requested':
        return { bg: 'bg-purple-100', color: 'text-purple-800', label: 'กำลังปรับปรุง', dot: 'bg-purple-500' };
      case 'pending':
      default:
        return { bg: 'bg-yellow-100', color: 'text-yellow-800', label: 'รอยืนยัน', dot: 'bg-yellow-500' };
    }
  };

  // ---------- Load real data ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
<<<<<<< HEAD
        // ดึงนัดหมายตามสิทธิ์: admin เห็นทั้งหมด, อื่น ๆ เห็นเฉพาะของตน
        let data;
        if (user?.role === 'admin') {
          data = await appointmentService.listAll();
        } else {
          data = await appointmentService.list();
        }
=======
        // ✅ ดึงนัดหมายทั้งหมด (ไม่จำกัดเฉพาะของผู้ใช้)
        const data = await appointmentService.listAll();
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
        if (!alive) return;
        setAppointments(Array.isArray(data) ? data : []);
      } catch (e) {
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
<<<<<<< HEAD
  }, [user]);
=======
  }, []);
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // ดึงจำนวนผู้ใช้งานทั้งหมด (นับง่าย ๆ จากเมธอด list() ของ userService)
        const users = await userService.list();
        if (!alive) return;
        setUsersCount(Array.isArray(users) ? users.length : (users?.total ?? 0));
      } catch (e) {
        if (!alive) return;
        setUsersCount(0);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ---------- Derived ----------
const totalAppointmentsCount = useMemo(() => (appointments || []).length, [appointments]);


const pendingAppointments = useMemo(() => {
  return (appointments || []).filter(a => (a?.status || '').toLowerCase() === 'pending');
}, [appointments]);

// const todayPendingCount = useMemo(() => {
//   return pendingAppointments.reduce((acc, a) => acc + (isTodayBangkok(toDateObj(a)) ? 1 : 0), 0);
// }, [pendingAppointments]);

  const recentPending = useMemo(() => {
    return pendingAppointments
      .slice()
      .sort((a, b) => (toDateObj(a) || 0) - (toDateObj(b) || 0));
  }, [pendingAppointments]);

  const handleCreateAppointment = () => {
    navigate('/appointments');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 relative overflow-hidden">
      {/* Background medical pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="medical-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
              <path d="M10 5 L10 15 M5 10 L15 10" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 lg:p-8 p-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white bg-opacity-5 rounded-full animate-bounce"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                  <path d="M9 9h2v4H9V9zm0-2h2v1H9V7z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-medium">ยินดีต้อนรับ!</h1>
            </div>

            <p className="text-lg mb-6 text-blue-100 leading-relaxed">
              ระบบบันทึกข้อมูลนัดหมายออนไลน์ที่ช่วยให้คุณจัดการนัดหมายได้ง่ายและรวดเร็ว
            </p>

            <button
              onClick={handleCreateAppointment}
              className="bg-cyan-500 shadow-xl shadow-cyan-500/50 hover:bg-cyan-400 hover:shadow-cyan-400/50 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-2 transform hover:scale-105 hover:-translate-y-1"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-lg">สร้างนัดหมายใหม่</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* นัดหมายทั้งหมด */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">จำนวนนัดหมายทั้งหมดของแอปเรา !</p>
                <p className="text-3xl font-bold text-gray-800">{totalAppointmentsCount}</p>
              </div>
            </div>
          </div>

          {/* ผู้ใช้งานทั้งหมด */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">ผู้ใช้งานทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-800">{usersCount}</p>
              </div>
              
            </div>
          </div>
        </div>

        {/* Recent Appointments — แสดงเฉพาะ 'รอยืนยัน' */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
              </svg>
              นัดหมายล่าสุด
            </h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">กำลังโหลดข้อมูล…</div>
          ) : error ? (
            <div className="py-10 text-center text-rose-600">{error}</div>
          ) : recentPending.length === 0 ? (
            <div className="py-10 text-center text-gray-500">ไม่มีนัดหมายสถานะ “รอยืนยัน”</div>
          ) : (
            <div className="space-y-4">
              {recentPending.map((appointment, index) => {
                const d = toDateObj(appointment); // ใช้สำหรับจัดลำดับ แต่จะไม่แสดงวันที่
                const { bg, color, label, dot } = getStatusProps(appointment.status);
                return (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 ${dot} rounded-full animate-pulse shadow-md`}></div>
                      <div>
                        {/* หัวข้อ */}
                        <p className="font-semibold text-gray-800 text-lg mb-1">
                          {appointment.title || 'ไม่ระบุหัวข้อ'}
                        </p>

                        {/*  ไม่แสดงวัน/เวลา ตาม requirement */}
                        <p className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                          </svg>
                          {formatThaiDateTime(d)}
                        </p>

                        {/* ชื่อโปรเจค (ยังแสดงได้) */}
                        {appointment.project?.name && (
                          <p className="text-gray-600">
                            โปรเจกต์: {appointment.project.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* สถานะ (แถบสี +ข้อความ) */}
                    <span className={`px-4 py-2 text-sm font-medium ${bg} ${color} rounded-full shadow-sm`}>
                      {label}
                    </span>

                    {/* ❌ ไม่แสดงปุ่มดูรายละเอียด เพื่อไม่ให้คนอื่นเห็นรายละเอียดเพิ่มเติม */}
                    {/* <button
                      onClick={() => navigate(`/appointments/${appointment._id}`)}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                    >
                      ดูรายละเอียด
                    </button> */}
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8 space-y-4">
            <button
              onClick={handleCreateAppointment}
              className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
              title="สร้างนัดหมายใหม่"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
