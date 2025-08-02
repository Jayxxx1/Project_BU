import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({

    title: { 
        type: String, 
        required: true,
        trim: true // ตัดช่องว่างหน้าหลัง
    },
    description: { 
        type: String,
        trim: true
    },
    reason: { 
        type: String,
        trim: true
    },
    date: { 
        type: Date, 
        required: true 
    },
    startTime: { 
        type: String, // เช่น "10:00" ควรใช้ String เพื่อความยืดหยุ่นหรือ Date สำหรับการคำนวณที่ซับซ้อน
        required: true 
    },
    endTime: {   
        type: String, // เช่น "11:00"
        required: true 
    },
    creator: { // รหัสผู้สร้าง (เชื่อมกับ User)
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    participants: [{ // ผู้เข้าร่วม (Array ของ ID ผู้เข้าร่วม, Reference ไป User)
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    status: { // สถานะของนัดหมาย
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    location: { // สถานที่ (zoom, สถานที่จริง)
        type: String,
        trim: true
    },
    meetingType: { // ประเภทการประชุม
        type: String, 
        enum: ['online', 'offline'], 
        default: 'offline' 
    },
    rescheduled: { // ระบุว่ามีการร้องขอเลื่อนนัดหรือไม่ 
        type: Boolean,
        default: false 
    },
    originalDate: { // วันที่เดิมก่อนถูกเลื่อน 
        type: Date 
    },
     originalStartTime: { // เวลาเริ่มต้นเดิมก่อนถูกเลื่อน
        type: String 
    },
    originalEndTime: { // เวลาสิ้นสุดเดิมก่อนถูกเลื่อน
        type: String 
    },
    rescheduleReason: { // เหตุผลสำหรับการขอเลื่อนนัด (โดยอาจารย์)
        type: String,
        trim: true
    },
    cancellationReason: { // เหตุผลในการยกเลิก (ใช้เมื่อ status เป็น 'cancelled')
        type: String,
        trim: true
    },
    meetingNotes: { // สำหรับบันทึกเนื้อหาการประชุมอย่างเป็นทางการ
        type: String,
        trim: true
    },
    relatedGroup: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group' 
    }
}, { 
    timestamps: true 
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;