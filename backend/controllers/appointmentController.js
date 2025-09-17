import Appointment from '../models/Appointment.js';
import Project from '../models/Project.js';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/mailer.js';
import { renderAppointmentCreatedEmail, buildIcs } from '../utils/emailTemplates.js';

/** แปลง date + time เป็น Date (+07:00) */
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

    // Validate project
    if (!project || !mongoose.Types.ObjectId.isValid(String(project))) {
      return res.status(400).json({ message: 'กรุณาระบุโปรเจคที่ถูกต้อง' });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'กรุณาระบุหัวข้อการนัดหมาย' });
    }
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'ต้องระบุวันที่และเวลาเริ่ม/สิ้นสุด' });
    }

    // meeting type + location
    const mType = meetingType || 'online';
    if (!['online', 'offline'].includes(mType)) {
      return res.status(400).json({ message: 'meetingType ไม่ถูกต้อง' });
    }
    if (mType === 'offline' && (!location || !String(location).trim())) {
      return res.status(400).json({ message: 'กรุณาระบุสถานที่เมื่อ meetingType เป็น offline' });
    }

    // เวลา
    const startAt = toDateTime(date, startTime);
    const endAt   = toDateTime(date, endTime);
    if (isNaN(startAt) || isNaN(endAt) || startAt >= endAt) {
      return res.status(400).json({ message: 'เวลาเริ่ม/สิ้นสุดไม่ถูกต้อง' });
    }
    if (startAt < new Date()) {
      return res.status(400).json({ message: 'ไม่สามารถสร้างนัดหมายในอดีตได้' });
    }

    // ทับซ้อนภายในโปรเจกต์
    const overlap = await Appointment.findOne({
      project,
      $or: [{ startAt: { $lt: endAt }, endAt: { $gt: startAt } }],
    }).lean();
    if (overlap) return res.status(409).json({ message: 'ช่วงเวลานี้ถูกจองแล้ว' });

    // สร้าง
    const participantIds = Array.isArray(participants)
      ? participants.map(p => (typeof p === 'string' ? p : p?._id)).filter(Boolean)
      : [];

    const allowedStatus = ['pending','approved','reschedule_requested','rejected','cancelled'];
    const setStatus = status && allowedStatus.includes(status) ? status : 'pending';

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
      status: setStatus,
      participantEmails,
      participants: participantIds,
      project: String(project).trim(),
      createBy: req.user.id,
    });

    // ดึงข้อมูลครบเพื่อนำไปส่งอีเมล
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

    // ====== ส่งอีเมลแจ้งเตือนไปยังอาจารย์ที่ปรึกษา ======
try {
  const advisorEmail = populated?.project?.advisor?.email || '6710210419@psu.ac.th';

  // สร้าง URL ไปยังหน้ารายละเอียดนัด 
  const FE = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const detailUrl = `${FE}/appointments/${populated._id}`;

  // เตรียมข้อมูลสำหรับเทมเพลต
  const html = renderAppointmentCreatedEmail({
    projectName: populated?.project?.name || '-',
    title: populated?.title || '',
    date: populated?.date,
    startTime: populated?.startTime,
    endTime: populated?.endTime,
    meetingType: populated?.meetingType,
    location: populated?.location,
    description: populated?.description || '',
    detailUrl,
  });

  // ให้ผู้รับกดเพิ่มเข้า Calendar ได้
  const icsContent = buildIcs({
    uid: `${populated._id}@projectbu`,
    title: populated.title,
    description: populated.description || '',
    // แปลงเป็น UTC ตาม 
    startUtc: populated.startAt,
    endUtc: populated.endAt,
    location: populated.meetingType === 'offline' ? (populated.location || '') : '',
    url: detailUrl,
  });

  await sendEmail({
    to: advisorEmail,
    subject: `การนัดหมายใหม่: ${populated.title}`,
    text:
      `มีนัดหมายใหม่ในโปรเจกต์ ${populated?.project?.name || '-'}\n` +
      `วันที่: ${populated.date} ${populated.startTime}-${populated.endTime}\n` +
      `รายละเอียด: ${detailUrl}`,
    html,
    attachments: [
      {
        filename: `${(populated.title || 'appointment').replace(/[^\w.-]+/g,'_')}.ics`,
        content: icsContent,
        contentType: 'text/calendar; charset=UTF-8; method=PUBLISH',
      }
    ],
  });
} catch (mailErr) {
  console.error('Send email failed:', mailErr?.message || mailErr);
}
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
};

/** รายการของฉัน */
export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
