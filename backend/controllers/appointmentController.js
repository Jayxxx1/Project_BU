import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

function toDateTime(dateStr, timeStr) {
  // เซตเป็น +07:00 ให้เทียบตรงกับเวลาไทย
  return new Date(`${dateStr}T${timeStr}:00+07:00`);
}

export const createAppointment = async (req, res, next) => {
  try {
    const {
      title, description, reason,
      date, startTime, endTime,
      meetingType, location,
      participants = [],
      participantEmails = [],
      status,
      relatedGroup,
      meetingNotes,
    } = req.body;

    // นักศึกษาต้องมี studentId ก่อนสร้าง
    if (req.user.role === 'student' && !req.user.studentId) {
      return res.status(400).json({ message: 'กรุณาเติม StudentID ในโปรไฟล์ก่อนสร้างนัดหมาย' });
    }

    const startAt = toDateTime(date, startTime);
    const endAt   = toDateTime(date, endTime);
    const now = new Date();

    if (!(startAt instanceof Date) || isNaN(startAt) || !(endAt instanceof Date) || isNaN(endAt)) {
      return res.status(400).json({ message: 'รูปแบบเวลาไม่ถูกต้อง' });
    }
    if (endAt <= startAt) return res.status(400).json({ message: 'เวลาสิ้นสุดต้องหลังเวลาเริ่ม' });
    if (startAt <= now)  return res.status(400).json({ message: 'ไม่สามารถเลือกเวลาอดีตได้' });

    const group = await Group.findById(relatedGroup).select('_id advisor').lean();
    if (!group) return res.status(400).json({ message: 'กลุ่มไม่ถูกต้อง' });

    // กันเวลาทับซ้อนภายในกลุ่ม
    const conflict = await Appointment.exists({
      relatedGroup,
      status: { $ne: 'cancelled' },
      startAt: { $lt: endAt },
      endAt:   { $gt: startAt },
    });
    if (conflict) return res.status(409).json({ message: 'ช่วงเวลานี้ถูกจองแล้ว' });

    const participantIds = participants;

    const doc = await Appointment.create({
      title: title?.trim() || '',
      description: description?.trim() || '',
      reason: reason?.trim() || '',
      date, startTime, endTime,
      startAt, endAt,
      meetingType: meetingType || 'online',
      location: location?.trim() || '',
      meetingNotes: meetingNotes?.trim() || '',
      status: status || 'pending',
      participantEmails,
      participants: participantIds,
      relatedGroup: relatedGroup?.trim() || '',
      createBy: req.user.id, 
    });

    const populated = await Appointment.findById(doc._id)
      .populate({
        path: 'relatedGroup',
        select: 'name groupNumber advisor members',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      })
      .populate('createBy', '_id username email role fullName studentId')
      .populate('participants', '_id username email role fullName studentId')
      .lean();

    res.status(201).json(populated);
  } catch (e) { next(e); }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const items = await Appointment.find({
      $or: [{ createBy: uid }, { participants: uid }],
    })
      .sort({ startAt: 1 })
      .populate('createBy', '_id username email role fullName studentId')
      .populate('participants', '_id username email role fullName studentId')
      .populate({
        path: 'relatedGroup',
        select: 'name groupNumber advisor members',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      });

    res.json(items);
  } catch (e) { next(e); }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Appointment.findById(id)
      .populate('createBy', '_id username email role fullName studentId')
      .populate('participants', '_id username email role fullName studentId')
      .populate({
        path: 'relatedGroup',
        select: 'name groupNumber advisor members',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      });

    if (!doc) return res.status(404).json({ message: 'Not found' });

    const uid = req.user._id;
    const authorized = doc.createBy._id.equals(uid) || doc.participants.some(p => p._id.equals(uid));
    if (!authorized) return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการลบกลุ่ม !' });

    res.json(doc);
  } catch (e) { next(e); }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const up = req.body;

    const doc = await Appointment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (!doc.createBy.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only creator/admin can update' });
    }

    const date = up.date ?? doc.date;
    const startTime = up.startTime ?? doc.startTime;
    const endTime = up.endTime ?? doc.endTime;

    const startAt = toDateTime(date, startTime);
    const endAt   = toDateTime(date, endTime);
    if (endAt <= startAt) return res.status(400).json({ message: 'เวลาสิ้นสุดต้องหลังเวลาเริ่ม' });
    if (startAt <= new Date()) return res.status(400).json({ message: 'ไม่สามารถเลือกเวลาอดีตได้' });

    // กันทับซ้อน (exclude ตัวเอง)
    const conflict = await Appointment.exists({
      _id: { $ne: id },
      relatedGroup: up.relatedGroup ?? doc.relatedGroup,
      status: { $ne: 'cancelled' },
      startAt: { $lt: endAt },
      endAt:   { $gt: startAt },
    });
    if (conflict) return res.status(409).json({ message: 'ช่วงเวลานี้ถูกจองแล้ว' });

    doc.title = up.title ?? doc.title;
    doc.description = up.description ?? doc.description;
    doc.reason = up.reason ?? doc.reason;
    doc.date = date;
    doc.startTime = startTime;
    doc.endTime = endTime;
    doc.startAt = startAt;
    doc.endAt = endAt;
    doc.meetingType = up.meetingType ?? doc.meetingType;
    doc.location = up.location ?? doc.location;
    doc.meetingNotes = up.meetingNotes ?? doc.meetingNotes;
    doc.participants = Array.isArray(up.participants) ? up.participants : doc.participants;
    doc.participantEmails = Array.isArray(up.participantEmails) ? up.participantEmails : doc.participantEmails;
    if (up.status) doc.status = up.status;
    if (up.relatedGroup) doc.relatedGroup = up.relatedGroup;

    await doc.save();

    const populated = await Appointment.findById(doc._id)
      .populate('createBy', '_id username email role fullName studentId')
      .populate('participants', '_id username email role fullName studentId')
      .populate({
        path: 'relatedGroup',
        select: 'name groupNumber advisor members',
        populate: [
          { path: 'advisor', select: '_id username email role fullName studentId' },
          { path: 'members', select: '_id username email role fullName studentId' },
        ],
      }).lean();

    res.json(populated);
  } catch (e) { next(e); }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Appointment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (!doc.createBy.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only creator/admin can delete' });
    }
    await doc.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};
