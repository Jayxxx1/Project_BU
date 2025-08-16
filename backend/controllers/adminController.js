import User from '../models/User.js';
import bcrypt from 'bcryptjs';


// POST /api/admin/teachers  (admin เท่านั้น) 
export const createTeacher = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'username, email, password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const teacher = await User.create({ username, email, password: hash, role: 'teacher' });
  res.status(201).json({ _id: teacher._id, username: teacher.username, email: teacher.email, role: teacher.role });
};

// GET /api/admin/teachers  (admin เท่านั้น) — list + ค้นหา
export const listTeachersAdmin = async (req, res) => {
  const { q } = req.query;
  const filter = { role: 'teacher' };
  if (q) filter.$or = [
    { username: { $regex: q, $options: 'i' } },
    { email:    { $regex: q, $options: 'i' } },
  ];
  const items = await User.find(filter).select('_id username email role').sort({ username: 1 });
  res.json(items);
};

// PATCH /api/admin/users/:id/role 
export const setRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['student','teacher','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('_id username email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
