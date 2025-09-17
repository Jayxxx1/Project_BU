import mongoose from 'mongoose';

/*
 * โครงสร้างข้อมูลสำหรับ Project ซึ่งตอนนี้ถูกนำมาใช้แทน Group
 */
const projectSchema = new mongoose.Schema(
  {
    // หมายเลขโปรเจคถูกยกเลิกในเวอร์ชันใหม่ เพราะใช้ปีการศึกษาและชื่อเป็นตัวระบุ
    name: {
      type: String,
      required: [true, 'กรุณากรอกชื่อโปรเจค'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'กรุณาระบุปีการศึกษา เช่น 2567'],
      trim: true,
      index: true,
      // Restrict academicYear to exactly four digits (Thai academic years such as 2567).  This prevents accidental
      // entry of characters or incorrect lengths.  Invalid values will trigger a Mongoose validation error.
      match: [/^\d{4}$/, 'ปีการศึกษาต้องเป็นตัวเลข 4 หลัก เช่น 2567'],
    },
    files: [
      {
        type: String,
        trim: true,
      },
    ],
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// ดัชนีช่วยค้นหาด้วยชื่อและผู้สร้าง, ปีการศึกษา
projectSchema.index({ name: 1, createdBy: 1 });
projectSchema.index({ createdBy: 1, academicYear: 1 });

export default mongoose.model('Project', projectSchema);
