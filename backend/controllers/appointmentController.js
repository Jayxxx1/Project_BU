import Appointment from '../models/Appointment.js';
import asyncHandler from 'express-async-handler';
export const createAppointment = asyncHandler(async (req, res) => {
  const { title, description, reason, date, startTime, endTime, participants, meetingType, location, relatedGroup } = req.body;
  if (!title || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error('กรุณากรอก title, date, startTime, endTime');
  }
  const appointment = new Appointment({
    title,
    description,
    reason,
    date,
    startTime,
    endTime,
    creator: req.user._id,
    participants,
    meetingType,
    location,
    relatedGroup
  });
  const created = await appointment.save();
  res.status(201).json(created);
});

// ดึงนัดหมายทั้งหมดของผู้ใช้งาน
export const getMyAppointments = async (req, res) => {
  const userId = req.user._id; // มาจาก token decode
  const appointments = await Appointment.find({ creator: userId });
  res.json(appointments);
};

// ดึงนัดหมายเฉพาะตัวตาม ID
export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('participants', 'Fullname email')
    .populate('creator', 'Fullname email');
  if (appointment) res.json(appointment);
  else {
    res.status(404);
    throw new Error('ไม่พบ appointment');
  }
});

// อัปเดตนัดหมาย
export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('ไม่พบ appointment');
  }
  if (appointment.creator.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('ไม่มีสิทธิ์อัปเดต');
  }
  Object.assign(appointment, req.body);
  const updated = await appointment.save();
  res.json(updated);
});

// ลบนัดหมาย
export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (appointment) {
    await appointment.remove();
    res.json({ message: 'ลบนัดหมายเรียบร้อย' });
  } else {
    res.status(404);
    throw new Error('ไม่พบ appointment');
  }
});