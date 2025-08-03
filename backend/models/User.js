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
      unique: true,
      match: [/.+@.+\..+/, 'กรุณากรอกอีเมลให้ถูกต้อง'],
    },
    password: {
      type: String,
      required: [true, 'กรุณากรอกรหัสผ่าน'],
      // เอา minlength ออก เพราะเช็คใน route แล้ว
    },
  },
  { timestamps: true }
);

// Hash password ก่อน save
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// Method ตรวจสอบรหัสผ่าน
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
