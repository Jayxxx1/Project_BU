import Appointment from '../models/Appointment.js';
import Project from '../models/Project.js';
import mongoose from 'mongoose';

/** แปลง date + time เป็น Date (โซนไทย +07:00) */
function toDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00+07:00`);
}

/** สร้างนัดหมาย */
export const createAppointment = async (req, res, next) => {
  try {
    const {
      title, description, reason,
      date, startTime, endTime,
      meetingType, location,
      participants = [],
      participantEmails = [],
      status,
      project,
      meetingNotes,
    } = req.body;

    // Validate project presence and format.  
    if (!project || !mongoose.Types.ObjectId.isValid(String(project))) {
      return res.status(400).json({ message: 'กรุณาระบุโปรเจคที่ถูกต้อง' });
    }

    // Basic validations
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'กรุณาระบุหัวข้อการนัดหมาย' });
    }
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'ต้องระบุวันที่และเวลาเริ่ม/สิ้นสุด' });
    }
    // Validate meetingType and location
    const mType = meetingType || 'online';
    if (!['online', 'offline'].includes(mType)) {
      return res.status(400).json({ message: 'meetingType ไม่ถูกต้อง' });
    }
    if (mType === 'offline' && (!location || !String(location).trim())) {
      return res.status(400).json({ message: 'กรุณาระบุสถานที่เมื่อ meetingType เป็น offline' });
    }

    // คำนวณเวลาเริ่ม/สิ้นสุด
    const startAt = toDateTime(date, startTime);
    const endAt   = toDateTime(date, endTime);
    if (!(startAt instanceof Date) || isNaN(startAt)) {
      return res.status(400).json({ message: 'รูปแบบเวลาเริ่มไม่ถูกต้อง' });
    }
    if (!(endAt instanceof Date) || isNaN(endAt)) {
      return res.status(400).json({ message: 'รูปแบบเวลาสิ้นสุดไม่ถูกต้อง' });
    }
    if (startAt >= endAt) {
      return res.status(400).json({ message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด' });
    }
    // Prevent scheduling appointments in the past 
    const now = new Date();
    if (startAt < now) {
      return res.status(400).json({ message: 'ไม่สามารถสร้างนัดหมายในอดีตได้' });
    }

    // ตรวจทับซ้อน (ตาม project เดียวกัน)
    if (project) {
      const overlap = await Appointment.findOne({
        project,
        $or: [
          { startAt: { $lt: endAt }, endAt: { $gt: startAt } },
        ],
      }).lean();
      if (overlap) return res.status(409).json({ message: 'ช่วงเวลานี้ถูกจองแล้ว' });
    }

    // map participants (_id)
    const participantIds = Array.isArray(participants)
      ? participants.map(p => (typeof p === 'string' ? p : p?._id)).filter(Boolean)
      : [];

    // Validate status if provided.  
    const allowedStatus = ['pending','approved','reschedule_requested','rejected','cancelled'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'สถานะการนัดหมายไม่ถูกต้อง' });
    }

    const doc = await Appointment.create({
      title,
      description,
      reason,
      date,
      startTime,
      endTime,
      startAt,
      endAt,
      meetingType: mType,
      location: location ? location.toString().trim() : '',
      meetingNotes,
      status: status && allowedStatus.includes(status) ? status : 'pending',
      participantEmails,
      participants: participantIds,
      project: String(project).trim(),
      createBy: req.user.id,
    });

    const populated = await Appointment.findById(doc._id)
      .populate('participants', '_id username email role fullName studentId')
      .populate('createBy', '_id username email role fullName studentId')
      .populate({
        path: 'project',
        select: 'name advisor members academicYear',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      });

    res.status(201).json(populated);
  } catch (e) { next(e); }
};

/** รายการนัดหมายของฉัน */
export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // โปรเจคที่เกี่ยวข้องกับฉัน
    const myProjectIds = await Project.find({
      $or: [{ members: userId }, { advisor: userId }],
    }).distinct('_id');

    const items = await Appointment.find({
      $or: [
        { createBy: userId },
        { participants: userId },
        { project: { $in: myProjectIds } },
      ],
    })
      .sort({ startAt: -1 })
      .populate('participants', '_id username email role fullName studentId')
      .populate('createBy', '_id username email role fullName studentId')
      .populate({
        path: 'project',
        select: 'name advisor members academicYear',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      })
      .lean();

    res.json(items);
  } catch (e) { next(e); }
};

/** getAllAppointments */
export const getAllAppointments = async (req, res, next) => {
  try {
    const items = await Appointment.find({})
      .select('title status project startAt')             
      .populate({ path: 'project', select: 'name' })       
      .sort({ startAt: -1 })
      .lean();

    const result = items.map((it) => ({
      _id: it._id,
      title: it.title || '',
      status: it.status || 'pending',
      startAt: it.startAt || null,                        
      project: {
        _id: it.project?._id || null,
        name: it.project?.name || '',
      },
    }));

    res.json(result);
  } catch (e) {
  }
};

/** อ่านรายการเดี่ยว (ยังคง enforce สิทธิ์เหมือนเดิม) */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await Appointment.findById(id)
      .populate('participants', '_id username email role fullName studentId')
      .populate('createBy', '_id username email role fullName studentId')
      .populate({
        path: 'project',
        select: 'name advisor members academicYear',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      });

    if (!doc) return res.status(404).json({ message: 'Not found' });

    // Allow admin to view any appointment detail without ownership constraints
    const isAdmin = req.user?.role === 'admin';
    const uid = req.user?.id?.toString();
    let canSee = isAdmin ||
      (doc.createBy?._id?.toString() === uid ||
       (doc.participants || []).some(p => p?._id?.toString() === uid));

    if (!canSee && doc.project) {
      const isAdvisor = doc.project?.advisor?._id?.toString() === uid;
      const isMember  = (doc.project?.members || []).some(m => m?._id?.toString() === uid);
      canSee = isAdmin || isAdvisor || isMember;
    }
    if (!canSee) return res.status(403).json({ message: 'Forbidden' });

    res.json(doc);
  } catch (e) { next(e); }
};

/** แก้ไขนัดหมาย */
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const up = req.body;

    const doc = await Appointment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    // อนุญาต ผู้สร้าง หรือ admin
    if (doc.createBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only creator/admin can update' });
    }

    // ตรวจเวลาใหม่
    const date      = up.date      ?? doc.date;
    const startTime = up.startTime ?? doc.startTime;
    const endTime   = up.endTime   ?? doc.endTime;

    const startAt = toDateTime(date, startTime);
    const endAt   = toDateTime(date, endTime);
    if (!(startAt instanceof Date) || isNaN(startAt)) {
      return res.status(400).json({ message: 'รูปแบบเวลาเริ่มไม่ถูกต้อง' });
    }
    if (!(endAt instanceof Date) || isNaN(endAt)) {
      return res.status(400).json({ message: 'รูปแบบเวลาสิ้นสุดไม่ถูกต้อง' });
    }
    if (startAt >= endAt) {
      return res.status(400).json({ message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด' });
    }

    // Prevent updating to a past start time
    const now2 = new Date();
    if (startAt < now2) {
      return res.status(400).json({ message: 'ไม่สามารถตั้งเวลานัดในอดีตได้' });
    }

    // Validate meetingType and location
    const futureMeetingType = up.meetingType || doc.meetingType;
    if (up.meetingType && !['online', 'offline'].includes(up.meetingType)) {
      return res.status(400).json({ message: 'meetingType ไม่ถูกต้อง' });
    }
    if (futureMeetingType === 'offline') {
      const loc = up.location !== undefined ? up.location : doc.location;
      if (!loc || !String(loc).trim()) {
        return res.status(400).json({ message: 'กรุณาระบุสถานที่เมื่อ meetingType เป็น offline' });
      }
    }

    // ตรวจทับซ้อน project เดิม (ไม่รวมตัวเอง)
    const projectId = (up.project ?? doc.project)?.toString() || '';
    if (projectId) {
      const conflict = await Appointment.findOne({
        _id: { $ne: doc._id },
        project: projectId,
        $or: [{ startAt: { $lt: endAt }, endAt: { $gt: startAt } }],
      }).lean();
      if (conflict) return res.status(409).json({ message: 'ช่วงเวลานี้ถูกจองแล้ว' });
    }

    // Validate status if provided.  
    if (up.status !== undefined) {
      const allowedStatus = ['pending','approved','reschedule_requested','rejected','cancelled'];
      if (up.status && !allowedStatus.includes(up.status)) {
        return res.status(400).json({ message: 'สถานะการนัดหมายไม่ถูกต้อง' });
      }
    }
    // อัปเดตฟิลด์
    doc.title        = up.title        ?? doc.title;
    doc.description  = up.description  ?? doc.description;
    doc.reason       = up.reason       ?? doc.reason;
    doc.date         = date;
    doc.startTime    = startTime;
    doc.endTime      = endTime;
    doc.startAt      = startAt;
    doc.endAt        = endAt;
    doc.meetingType  = up.meetingType  ?? doc.meetingType;
    if (up.location !== undefined) {
      doc.location = up.location ? up.location.toString().trim() : '';
    }
    doc.meetingNotes = up.meetingNotes ?? doc.meetingNotes;
    doc.status       = up.status       ?? doc.status;
    doc.project      = up.project      ?? doc.project;

    if (Array.isArray(up.participants)) {
      doc.participants = up.participants.map(p => (typeof p === 'string' ? p : p?._id)).filter(Boolean);
    }
    if (Array.isArray(up.participantEmails)) {
      doc.participantEmails = up.participantEmails;
    }

    await doc.save();

    const populated = await Appointment.findById(doc._id)
      .populate('participants', '_id username email role fullName studentId')
      .populate('createBy', '_id username email role fullName studentId')
      .populate({
        path: 'project',
        select: 'name advisor members academicYear',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      });

    res.json(populated);
  } catch (e) { next(e); }
};

/** ลบนัดหมาย */
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Appointment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (doc.createBy.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only creator/admin can delete' });
    }
    await doc.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};
