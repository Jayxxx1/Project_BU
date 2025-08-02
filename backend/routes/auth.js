import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: 'กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่านให้ครบถ้วน' });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร' });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    }
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newUser = await User.create({ username, email, password: hashed });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Register error:', error);
    res
      .status(500)
      .json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '99d',
    });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res
      .status(500)
      .json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์', error: error.message });
  }
});

export default router;
