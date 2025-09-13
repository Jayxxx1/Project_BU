import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// ===== เดิม: สร้างอาจารย์ =====
export const createTeacher = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'username, email, password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const teacher = await User.create({ username, email, password: hash, role: 'teacher' });
  res.status(201).json({ _id: teacher._id, username: teacher.username, email: teacher.email, role: teacher.role });
};

// ===== เดิม: ลิสต์อาจารย์ =====
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

// ===== เดิม: ตั้ง role แบบเฉพาะคน =====
export const setRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['student','teacher','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('_id username email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// ===== ใหม่: ลิสต์ผู้ใช้ทั้งหมด + ค้นหา/กรอง =====
export const listAllUsers = async (req, res) => {
  const { q = "", role } = req.query;
  const filter = {};
  if (role && ['student','teacher','admin'].includes(role)) filter.role = role;
  if (q && q.trim()) {
    const kw = new RegExp(q.trim(), 'i');
    filter.$or = [{ username: kw }, { email: kw }, { fullName: kw }];
  }
  const items = await User.find(filter)
    .sort({ createdAt: -1 })
    .select('_id username email role fullName studentId status createdAt');
  res.json(items);
};

// ===== ใหม่: สร้างผู้ใช้กำหนด role =====
export const createUserAdmin = async (req, res) => {
  const { username, email, password, role, fullName, studentId } = req.body || {};
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'username, email, password, role required' });
  }
  if (!['student','teacher','admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (role === 'student' && !studentId) {
    return res.status(400).json({ message: 'studentId required for role=student' });
  }

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ message: 'username or email already in use' });

  if (role === 'student' && studentId) {
    const stu = await User.findOne({ studentId });
    if (stu) return res.status(409).json({ message: 'studentId already in use' });
  }

  const hash = await bcrypt.hash(password, 10);
  const doc = await User.create({
    username, email, password: hash, role,
    fullName: fullName || '',
    studentId: role === 'student' ? studentId : undefined,
    status: 'active',
  });

  const safe = (({ _id, username, email, role, fullName, studentId, status, createdAt }) =>
    ({ _id, username, email, role, fullName, studentId, status, createdAt }))(doc);

  res.status(201).json(safe);
};

// 
// export const updateUserStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body || {};
//   if (!['active','inactive'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

//   const user = await User.findById(id);
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   if (user.role === 'admin' && status === 'inactive') return res.status(400).json({ message: 'cannot deactivate admin' });

//   user.status = status;
//   await user.save();
//   res.json({ _id: user._id, status: user.status });
// };

// ===== ใหม่: ลบผู้ใช้ (กันลบ admin) =====
export const deleteUserAdmin = async (req, res) => {
  const { id } = req.params;

  // กันลบตัวเอง (ถ้ามี req.user)
  if (req.user && String(req.user.id) === String(id)) {
    return res.status(400).json({ message: 'cannot delete yourself' });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'cannot delete admin' });

  await user.deleteOne();
  res.json({ message: 'deleted' });
};
