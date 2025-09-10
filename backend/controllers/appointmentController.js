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

    const doc = await Appointment.create({
      title, description, reason,
      date, startTime, endTime,
      startAt, endAt,
      meetingType, location,
      meetingNotes,
      status: status || 'pending',
      participantEmails,
      participants: participantIds,
      project: project?.trim() || '',
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

/** รายการนัดหมายของฉัน (เดิม) */
export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // โปรเจคที่เกี่ยวข้องกับฉัน (เป็นสมาชิกหรือที่ปรึกษา)
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

/** 
 *  คนที่ไม่มีสิทธิ์จะเปิดดูรายละเอียดเชิงลึกผ่าน /:id ก็ยังโดน 403 เหมือนเดิม
 */
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
    next(e);
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

    // เงื่อนไขสิทธิ์: ผู้สร้าง, ผู้เข้าร่วม, ที่ปรึกษา/สมาชิกโปรเจค
    const uid = req.user?.id?.toString();
    let canSee =
      doc.createBy?._id?.toString() === uid ||
      (doc.participants || []).some(p => p?._id?.toString() === uid);

    if (!canSee && doc.project) {
      const isAdvisor = doc.project?.advisor?._id?.toString() === uid;
      const isMember  = (doc.project?.members || []).some(m => m?._id?.toString() === uid);
      canSee = isAdvisor || isMember;
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
    doc.location     = up.location     ?? doc.location;
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
