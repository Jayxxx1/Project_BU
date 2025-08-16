import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

function combineToDate(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return new Date(y, (m - 1), d, hh, mm, 0, 0);
}

export const createAppointment = async (req, res) => {
  try {
    const {
      title, description, reason,
      date, startTime, endTime,
      meetingType, location,
      participants,
      participantEmails,
      status, relatedGroup,
    } = req.body;

    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'title, date, startTime, endTime are required' });
    }

    const mt = meetingType || 'online';
    if (mt === 'offline' && !location) {
      return res.status(400).json({ message: 'location is required for offline meetings' });
    }

    const startAt = combineToDate(date, startTime);
    const endAt = combineToDate(date, endTime);
    if (isNaN(startAt) || isNaN(endAt)) {
      return res.status(400).json({ message: 'Invalid date/time format' });
    }
    if (startAt >= endAt) {
      return res.status(400).json({ message: 'startTime must be earlier than endTime' });
    }

    // resolve participants from ids + emails
    let participantIds = Array.isArray(participants) ? [...participants] : [];
    if (Array.isArray(participantEmails) && participantEmails.length) {
      const found = await User.find({ email: { $in: participantEmails } }).select('_id email');
      participantIds.push(...found.map(u => u._id.toString()));
      participantIds = [...new Set(participantIds)];
    }

    const doc = await Appointment.create({
      title, description: description?.trim() || '',
      reason: reason?.trim() || '',
      date, startTime, endTime, startAt, endAt,
      meetingType: mt, location: location?.trim() || '',
      status: status || 'pending',
      creator: req.user.id,
      participants: participantIds,
      relatedGroup: relatedGroup?.trim() || '',
    });

    const populated = await doc.populate([
      { path: 'creator', select: '_id username email' },
      { path: 'participants', select: '_id username email' },
    ]);

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to create appointment' });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const { from, to, status, q } = req.query;

    const filters = { $or: [{ creator: req.user.id }, { participants: req.user.id }] };
    if (status) filters.status = status;
    if (from || to) {
      filters.startAt = {};
      if (from) filters.startAt.$gte = new Date(from);
      if (to) filters.startAt.$lte = new Date(to);
    }
    if (q) {
      filters.$and = [{
        $or: [
          { title:      { $regex: q, $options: 'i' } },
          { description:{ $regex: q, $options: 'i' } },
          { reason:     { $regex: q, $options: 'i' } },
          { location:   { $regex: q, $options: 'i' } },
        ]
      }];
    }

    const items = await Appointment.find(filters)
      .sort({ startAt: 1 })
      .populate([
        { path: 'creator', select: '_id username email' },
        { path: 'participants', select: '_id username email' },
      ]);

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch appointments' });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Appointment.findById(id)
      .populate([
        { path: 'creator', select: '_id username email' },
        { path: 'participants', select: '_id username email' },
      ]);
    if (!doc) return res.status(404).json({ message: 'Appointment not found' });

    const uid = req.user.id.toString();
    const authorized = doc.creator._id.equals(uid) || doc.participants.some(p => p._id.equals(uid));
    if (!authorized) return res.status(403).json({ message: 'Forbidden' });

    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch appointment' });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Appointment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Appointment not found' });

    if (!doc.creator.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only creator can update' });
    }

    const up = {};
    const allowed = [
      'title','description','reason',
      'date','startTime','endTime',
      'meetingType','location','status',
      'participants','participantEmails',
      'meetingNotes','relatedGroup',
      'isRescheduled','rescheduleReason'
    ];
    for (const k of allowed) if (k in req.body) up[k] = req.body[k];

    const date = up.date ?? doc.date;
    const startTime = up.startTime ?? doc.startTime;
    const endTime = up.endTime ?? doc.endTime;
    up.startAt = combineToDate(date, startTime);
    up.endAt   = combineToDate(date, endTime);
    if (up.startAt >= up.endAt) {
      return res.status(400).json({ message: 'startTime must be earlier than endTime' });
    }

    let participantIds = Array.isArray(up.participants) ? [...up.participants] : doc.participants.map(x=>x.toString());
    if (Array.isArray(up.participantEmails) && up.participantEmails.length) {
      const found = await User.find({ email: { $in: up.participantEmails } }).select('_id email');
      participantIds.push(...found.map(u => u._id.toString()));
      participantIds = [...new Set(participantIds)];
    }
    up.participants = participantIds;

    Object.assign(doc, up);
    await doc.save();

    const populated = await doc.populate([
      { path: 'creator', select: '_id username email' },
      { path: 'participants', select: '_id username email' },
    ]);
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update appointment' });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Appointment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Appointment not found' });

    if (!doc.creator.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only creator can delete' });
    }

    await doc.deleteOne();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete appointment' });
  }
};
