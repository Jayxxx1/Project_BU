import mongoose from 'mongoose';
import Project from '../models/Project.js';
import User from '../models/User.js';

// Helper: check if user is teacher
const isTeacher = async (id) => {
  const u = await User.findById(id).select('_id role');
  return !!u && u.role === 'teacher';
};

// Helper: check if user is student
const isStudent = async (id) => {
  const u = await User.findById(id).select('_id role');
  return !!u && u.role === 'student';
};

// Helper: convert to string id
const toStrId = (v) => (typeof v === 'string' ? v : v?.toString());

// สร้างโปรเจคใหม่ 
export const createProject = async (req, res, next) => {
  try {
    const {
      name,
      description = '',
      advisorId,
      memberIds = [],
      academicYear,
      files = [],
    } = req.body;

    // Validate academicYear numeric pattern (4 digits).  
    if (!/^[0-9]{4}$/.test(String(academicYear || '').trim())) {
      return res.status(400).json({ message: 'ปีการศึกษาต้องเป็นตัวเลข 4 หลัก เช่น 2567' });
    }
    // Validate basic fields
    if (!name || !advisorId || !academicYear) {
      return res.status(400).json({ message: 'กรอกชื่อโปรเจค เลือกอาจารย์ และปีการศึกษาให้ครบถ้วน' });
    }

    // Validate advisor is teacher
    if (!(await isTeacher(advisorId))) {
      return res.status(400).json({ message: 'advisorId ต้องเป็นอาจารย์ (teacher)' });
    }

    // ตรวจสอบว่าไม่ว่าเป็นบทบาทใด ผู้สร้างยังไม่มีโปรเจคในปีการศึกษานี้
    const userId = req.user.id;
    const exists = await Project.exists({ createdBy: userId, academicYear });
    if (exists) {
      return res.status(400).json({ message: 'คุณมีโปรเจคในปีการศึกษานี้แล้ว' });
    }

    // Build initial member set: include creator if student
    const rawSet = new Set(memberIds.map(toStrId));
    if (req.user.role === 'student') rawSet.add(userId);

    const finalMembers = [];
    for (const mid of rawSet) {
      if (!mid) continue;
      // Accept only students
      if (!(await isStudent(mid))) continue;
      // Ensure this member is not already in another project for this academic year
      const exists = await Project.exists({ academicYear, members: mid });
      if (exists) {
        // Skip members already in a project this year
        continue;
      }
      finalMembers.push(mid);
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      academicYear: academicYear.trim(),
      files: Array.isArray(files) ? files.filter(Boolean) : [],
      advisor: advisorId,
      members: finalMembers,
      createdBy: userId,
    };
    const doc = await Project.create(payload);
    const populated = await Project.findById(doc._id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

// ดึงโปรเจคทั้งหมด (active)
export const listProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    res.json(projects);
  } catch (err) { next(err); }
};

// ดึงโปรเจคที่เกี่ยวข้องกับผู้ใช้ 
export const listMyProjects = async (req, res, next) => {
  try {
    const uid = toStrId(req.user.id);
    const items = await Project.find({
      status: 'active',
      $or: [
        { members: uid },
        { advisor: uid },
        { createdBy: uid },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    res.json(items);
  } catch (err) { next(err); }
};

// ดึงข้อมูลโปรเจคแต่ละรายการ
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

// แก้ไขโปรเจค 
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const up = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // ตรวจสิทธิ์: ผู้สร้างหรือ admin เท่านั้น
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขโปรเจคนี้' });
    }

    if (up.name) project.name = up.name.trim();
    if (up.description !== undefined) project.description = up.description.trim();
    // ไม่อนุญาตให้เปลี่ยน academicYear ของโปรเจค
    if (up.academicYear && up.academicYear !== project.academicYear) {
      return res.status(400).json({ message: 'ไม่สามารถเปลี่ยนปีการศึกษาของโปรเจคนี้ได้' });
    }
    if (up.files && Array.isArray(up.files)) {
      project.files = up.files.filter(Boolean);
    }
    if (up.advisorId) {
      if (!(await isTeacher(up.advisorId))) {
        return res.status(400).json({ message: 'advisorId must be a teacher' });
      }
      project.advisor = up.advisorId;
    }
    if (up.status !== undefined) {
      const allowed = ['active','archived'];
      if (up.status && !allowed.includes(up.status)) {
        return res.status(400).json({ message: 'status ไม่ถูกต้อง' });
      }
      project.status = up.status;
    }
    await project.save();
    const populated = await Project.findById(project._id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    res.json(populated);
  } catch (err) { next(err); }
};

// ลบโปรเจค (soft delete)
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบโปรเจคนี้' });
    }
    project.status = 'archived';
    await project.save();
    res.json({ message: 'Archived' });
  } catch (err) { next(err); }
};

// ค้นหา user เพื่อเพิ่มสมาชิก
export const searchUsers = async (req, res, next) => {
  try {
    const qRaw   = (req.query.q || '').trim();
    let role  = (req.query.role || 'student').trim().toLowerCase();
    // Only allow valid roles; default to student if invalid
    if (!['student','teacher','admin'].includes(role)) role = 'student';
    // Sanitize limit: must be positive integer; default 10; max 50
    const parsedLimit = parseInt(req.query.limit, 10);
    let limit = 10;
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 50);
    }
    const q = qRaw;
    const academicYear = req.query.academicYear;
    const excludeProject = req.query.excludeProject;
    const excludeIds = req.query.excludeIds
      ? req.query.excludeIds.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const filter = {};
    if (role) filter.role = role;
    if (q) {
      // Escape regex special characters in the search query to prevent Regex DoS or injection of special patterns.
      const safePattern = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { username: new RegExp(safePattern, 'i') },
        { email: new RegExp(safePattern, 'i') },
      ];
    }

    const combinedExcludeIds = new Set(excludeIds);
    const currentUserId = toStrId(req.user.id);
    combinedExcludeIds.add(currentUserId);

    // หากระบุ excludeProject ให้เอา advisor และสมาชิกออกจากตัวเลือก
    if (excludeProject) {
      const p = await Project.findById(excludeProject).select('members advisor').lean();
      if (p?.advisor) combinedExcludeIds.add(toStrId(p.advisor));
      (p?.members || []).map(toStrId).forEach(id => combinedExcludeIds.add(id));
    }
    // หากระบุ academicYear ให้ไม่รวมสมาชิกที่อยู่ในโปรเจคปีนั้นอยู่แล้ว
    if (academicYear) {
      const conflicts = await Project.find({ academicYear }).select('members');
      conflicts.forEach(doc => (doc.members || []).map(toStrId).forEach(id => combinedExcludeIds.add(id)));
    }

    if (combinedExcludeIds.size > 0) {
      const ninIds = [...combinedExcludeIds]
        .map(id => (typeof id === 'string' ? id.trim() : toStrId(id)))
        .filter(Boolean)
        .filter(id => mongoose.isValidObjectId(id))
        .map(id => new mongoose.Types.ObjectId(id));
      if (ninIds.length) filter._id = { $nin: ninIds };
    }

    const users = await User.find(filter)
      .select('_id username email role fullName studentId')
      .limit(limit)
      .lean();

    res.json(users);
  } catch (err) { next(err); }
};

// เพิ่มสมาชิก
export const addMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { memberIds = [] } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // ตรวจสิทธิ์: ผู้สร้างหรือ admin เท่านั้น
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เพิ่มสมาชิกในโปรเจคนี้' });
    }

    const addList = [];
    for (const mid of memberIds.map(toStrId)) {
      if (!mid) continue;
      // ห้ามเพิ่ม advisor เป็นสมาชิก
      if (toStrId(project.advisor) === mid) continue;
      // ข้ามคนที่อยู่แล้ว
      if (project.members.map(toStrId).includes(mid)) continue;
      // รับเฉพาะนักศึกษา
      if (!(await isStudent(mid))) continue;
      // ตรวจสอบว่าคนนี้ไม่ได้อยู่ในโปรเจคปีเดียวกันแล้ว
      const exists = await Project.exists({ academicYear: project.academicYear, members: mid });
      if (exists) continue;
      addList.push(mid);
    }
    if (addList.length) {
      await Project.updateOne({ _id: id }, { $addToSet: { members: { $each: addList } } });
    }
    const populated = await Project.findById(id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    res.json(populated);
  } catch (err) { next(err); }
};

// ลบสมาชิก 
export const removeMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { memberIds = [] } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // ตรวจสิทธิ์: ผู้สร้างหรือ admin เท่านั้น
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบสมาชิกในโปรเจคนี้' });
    }

    const removeList = memberIds.map(toStrId).filter(mid => mid && mid !== toStrId(project.createdBy));
    if (removeList.length) {
      await Project.updateOne({ _id: id }, { $pull: { members: { $in: removeList } } });
    }
    const populated = await Project.findById(id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .populate('createdBy', '_id username email role fullName studentId')
      .lean();
    res.json(populated);
  } catch (err) { next(err); }
};
