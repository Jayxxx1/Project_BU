import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'กรุณากรอกชื่อผู้ใช้'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'กรุณากรอกอีเมล'],
      trim: [true],
      unique: true,
      match: [/.+@.+\..+/, 'กรุณากรอกอีเมลให้ถูกต้อง'],
    },
    password: {
      type: String,
      required: [true, 'กรุณากรอกรหัสผ่าน'],
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'], default: 'student', index: true
    },
    fullName: {
      type: String, trim: true, default: ''
    },
    studentId: {
      type: String,
      trim: true,
      required: function () { return this.role === 'student'; },
      // Require studentId for students to be a 10-digit numeric string.  Without this validation the system
      // could store arbitrary text or non-numeric IDs.  The regex enforces exactly 10 digits and throws a
      // validation error if the input is invalid.  Note: partialFilterExpression for uniqueness remains intact below.
      match: [/^\d{10}$/, 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก'],
    },

  },
  { timestamps: true }
);

userSchema.index(
  { studentId: 1 },
  { unique: true, partialFilterExpression: { role: 'student', studentId: { $type: 'string' } } }
);

// Method ตรวจสอบรหัสผ่าน
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
