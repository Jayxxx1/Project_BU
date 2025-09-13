import mongoose from 'mongoose';

/*
 * โครงสร้างข้อมูลสำหรับ Project ซึ่งตอนนี้ถูกนำมาใช้แทน Group
 * หนึ่งโปรเจคจะมี
 *  - projectNumber: หมายเลขหรือลำดับโปรเจค (เดิมคือ groupNumber)
 *  - name: ชื่อโปรเจค/กลุ่ม
 *  - description: รายละเอียดโปรเจค
 *  - academicYear: ปีการศึกษาที่โปรเจคอยู่ (จำเป็น)
 *  - files: รายการไฟล์อัปโหลดประจำโปรเจค (เก็บเป็นสตริงของชื่อไฟล์หรือลิงก์)
 *  - advisor: ผู้ให้คำปรึกษา (อาจารย์)
 *  - members: สมาชิกในโปรเจค (นักศึกษา)
 *  - createdBy: ผู้สร้างโปรเจค (มักเป็นนักศึกษาหรืออาจารย์)
 *  - status: สถานะ (active/archived)
 */
const projectSchema = new mongoose.Schema(
  {
    // หมายเลขโปรเจคถูกยกเลิกในเวอร์ชันใหม่ เพราะใช้ปีการศึกษาและชื่อเป็นตัวระบุ
    // หากต้องการระบุลำดับพิเศษสามารถเพิ่มในอนาคตได้ แต่ไม่จำเป็นอีกต่อไป
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