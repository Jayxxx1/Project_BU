import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAppointments } from '../services/appointmentService';
import { Link } from "react-router-dom";

export default function AppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    appointments
      getAppointments(token)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div className="bg-[url(./bg/bg.webp)] bg-cover bg-center bg-no-repeat min-h-screen">
    <div className="p-4">
      {appointments.length === 0 ? (
        <div className="text-center mt-8">
          <h1>คุณยังไม่มีนัดหมาย</h1>
          <Link to="/appointments/create" className="text-blue-600 underline">
            คลิกที่นี่เพื่อสร้างนัดหมายใหม่
          </Link>
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-semibold mb-4">นัดหมายของคุณ</h1>
          <ul>
            {appointments.map((a) => (
              <li key={a._id} className="mb-2 p-2 border rounded">
                <div>
                  <strong>{a.title}</strong> - {a.date} เวลา {a.startTime}
                </div>
                <div>สถานะ: {a.status}</div>
              </li>
            ))}
          </ul>
          <div className="text-center mt-4">
            <Link to="/appointments/create" className="text-blue-600 underline">
              + สร้างนัดหมายใหม่
            </Link>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
