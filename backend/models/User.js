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
      enum: ['Student', 'teacher', 'admin'], default: 'Student', index: true
    }
  },
  { timestamps: true }
);


// Method ตรวจสอบรหัสผ่าน
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
