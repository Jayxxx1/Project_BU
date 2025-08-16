import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 120,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
            maxlength: 2000,
        },
        reason: {
            type: String,
            trim: true,
            default: '',
            maxlength: 500,
        },

        date: { type: String, required: true },      // 'YYYY-MM-DD' 
        startTime: { type: String, required: true }, // 'HH:mm'
        endTime: { type: String, required: true },   // 'HH:mm'
        startAt: { type: Date, required: true },
        endAt: { type: Date, required: true },

        meetingType: {
            type: String,
            enum: ['online', 'offline'],
            required: true,
            default: 'online',
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
            default: 'pending',
            index: true,
        },
        relatedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true, default: null },


        // ความเป็นเจ้าของ/ผู้เกี่ยวข้อง
        creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],

        // บันทึกหลังประชุม
        meetingNotes: { type: String, trim: true, default: '' },

        // เผื่อขยายระบบกลุ่มที่เกี่ยวข้อง/หลักสูตร ฯลฯ
        relatedGroup: { type: String, trim: true, default: '' },

        // เผื่อรองรับการเลื่อนนัด
        isRescheduled: { type: Boolean, default: false },
        rescheduleReason: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

// ป้องกันเวลาเพี้ยน: startAt ต้อง < endAt
AppointmentSchema.pre('validate', function (next) {
    if (this.startAt >= this.endAt) {
        return next(new Error('startAt must be earlier than endAt'));
    }
    next();
});

export default mongoose.model('Appointment', AppointmentSchema);
