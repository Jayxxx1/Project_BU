import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyAppointments } from '../services/appointmentService';

export default function AppointmentsPages() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      try {
        const data = await getMyAppointments(token);
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  // ฟังก์ชันช่วยแปลงวันที่และเวลา
  const formatStartDateTime = (date, startTime) => {
    try {
      // รวม date + startTime เป็น ISO string แล้วแปลงเป็น Date object
      const dateOnly = date.split('T')[0]; // ตัดเวลาทิ้งเหลือแค่วัน
      const isoString = `${dateOnly}T${startTime}:00`; // เติมวินาที
      const dt = new Date(isoString);
      return dt.toLocaleString();
    } catch {
      return date;
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
      <h2>นี่คือหน้า นัดหมายของฉัน</h2>
      {loading ? (
        <p>กำลังโหลดนัดหมาย...</p>
      ) : appointments.length === 0 ? (
        <p>ไม่มีนัดหมายในระบบ</p>
      ) : (
        <ul style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto', listStyleType: 'none', padding: 0 }}>
          {appointments.map((appt) => (
            <li key={appt._id} style={{ backgroundColor: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <strong>วันที่:</strong> {formatStartDateTime(appt.date, appt.startTime)}<br />
              <strong>เรื่อง:</strong> {appt.title}<br />
              <strong>คำอธิบาย:</strong> {appt.description || '-'}<br />
              <strong>สถานะ:</strong> {appt.status}<br />
              {appt.location && (
                <>
                  <strong>สถานที่/ลิงก์:</strong>{' '}
                  <a href={appt.location} target="_blank" rel="noopener noreferrer">
                    {appt.location}
                  </a>
                  <br />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
