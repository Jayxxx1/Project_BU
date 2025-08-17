import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  title:        { type: String, trim: true },
  description:  { type: String, trim: true },
  reason:       { type: String, trim: true },
  date:         { type: String, required: true },      // YYYY-MM-DD
  startTime:    { type: String, required: true },      // HH:mm
  endTime:      { type: String, required: true },      // HH:mm
  startAt:      { type: Date, index: true },           // คำนวณตอนสร้าง/แก้ไข
  endAt:        { type: Date, index: true },

  meetingType:  { type: String, enum: ['online','offline'], default: 'online' },
  location:     { type: String, trim: true, default: '' },
  meetingNotes: { type: String, trim: true, default: '' },

  relatedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantEmails: [{ type: String, trim: true }],

  createBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status:       { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending', index: true },
}, { timestamps: true });

appointmentSchema.index({ relatedGroup: 1, startAt: 1, endAt: 1 });
appointmentSchema.pre('validate', function (next) {
    if (this.startAt >= this.endAt) {
        return next(new Error('เวลาเริ่ม ไม่ควรน้อยกว่า เวลาสิ้นสุด !'));
    }
    next();
});

export default mongoose.model('Appointment', appointmentSchema);
