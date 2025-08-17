import mongoose from 'mongoose';
import Group from '../models/Group.js';
import User from '../models/User.js';

const toStrId = (v) => (typeof v === 'string' ? v : v?.toString());

const isTeacher = async (id) => {
  const u = await User.findById(id).select('_id role');
  return !!u && u.role === 'teacher';
};

const isStudent = async (id) => {
  const u = await User.findById(id).select('_id role');
  return !!u && u.role === 'student';
};

const ensureRequester = (req) => {
  const userId = toStrId(req.user?._id || req.user?.id);
  if (!userId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  return userId;
};

// POST /api/groups
export const createGroup = async (req, res, next) => {
  try {
    const { groupNumber, name, description = '', advisorId, memberIds = [] } = req.body;

    if (!name || !advisorId) return res.status(400).json({ message: 'กรอกชื่อกลุ่มและเลือกอาจารย์' });
    if (!(await isTeacher(advisorId))) return res.status(400).json({ message: 'advisorId ต้องเป็นอาจารย์ (teacher)' });

    const userId = ensureRequester(req);
    const uniqueMembers = Array.from(new Set([userId, ...memberIds.map(toStrId)]));

    const payload = {
      groupNumber: `${groupNumber}`.trim(),
      name: name.trim(),
      description: description.trim(),
      advisor: advisorId,
      members: uniqueMembers,
      createdBy: userId,
    };

    const doc = await Group.create(payload);

    const populated = await Group.findById(doc._id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .lean();

    res.status(201).json(populated);
  } catch (e) { next(e); }
};

// GET /api/groups/mine
export const listMyGroups = async (req, res, next) => {
  try {
    const uid = ensureRequester(req);
    const items = await Group.find({
      status: 'active',
      $or: [{ members: uid }, { advisor: uid }],
    })
      .sort({ createdAt: -1 })
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .lean();

    res.json(items);
  } catch (e) { next(e); }
};

// PATCH /api/groups/:id
export const updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const g = await Group.findById(id);
    if (!g) return res.status(404).json({ message: 'Group not found' });

    const requesterId = ensureRequester(req);
    if (toStrId(g.createdBy) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, description, advisorId, status, groupNumber } = req.body;
    if (name) g.name = name;
    if (description !== undefined) g.description = description;
    if (status) g.status = status;
    if (groupNumber !== undefined) g.groupNumber = groupNumber;
    if (advisorId) {
      if (!(await isTeacher(advisorId))) return res.status(400).json({ message: 'advisorId must be a teacher' });
      g.advisor = advisorId;
    }

    await g.save();

    const populated = await Group.findById(g._id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .lean();

    res.json(populated);
  } catch (e) { next(e); }
};

// DELETE /api/groups/:id
export const deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const g = await Group.findById(id);
    if (!g) return res.status(404).json({ message: 'Group not found' });

    const requesterId = ensureRequester(req);
    if (toStrId(g.createdBy) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await g.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};

// GET /api/groups/search-users?q=&role=student&limit=10&excludeGroup=<id>&excludeIds=<id1,id2>
export const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const role = (req.query.role || 'student').trim();
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const excludeGroup = req.query.excludeGroup;
    const excludeIds = req.query.excludeIds
      ? req.query.excludeIds.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { username: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
      ];
    }

    const combinedExcludeIds = new Set(excludeIds);
    const currentUserId = ensureRequester(req);
    combinedExcludeIds.add(currentUserId);

    if (excludeGroup) {
      const g = await Group.findById(excludeGroup).select('members advisor').lean();
      if (g?.advisor) combinedExcludeIds.add(toStrId(g.advisor));
      (g?.members || []).map(toStrId).forEach(id => combinedExcludeIds.add(id));
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
  } catch (e) { next(e); }
};

// PATCH /api/groups/:id/members/add  { memberIds: [] }
export const addMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { memberIds = [] } = req.body;
    const g = await Group.findById(id);
    if (!g) return res.status(404).json({ message: 'Group not found' });

    const requesterId = ensureRequester(req);
    if (toStrId(g.createdBy) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const addList = [];
    for (const mid of memberIds.map(toStrId)) {
      if (!mid) continue;
      if (toStrId(g.advisor) === mid) continue;
      if (g.members.map(toStrId).includes(mid)) continue;
      if (!(await isStudent(mid))) continue;
      addList.push(mid);
    }

    if (addList.length) {
      await Group.updateOne({ _id: id }, { $addToSet: { members: { $each: addList } } });
    }

    const populated = await Group.findById(id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .lean();

    res.json(populated);
  } catch (e) { next(e); }
};

// PATCH /api/groups/:id/members/remove  { memberIds: [] }
export const removeMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { memberIds = [] } = req.body;
    const g = await Group.findById(id);
    if (!g) return res.status(404).json({ message: 'Group not found' });

    const requesterId = ensureRequester(req);
    if (toStrId(g.createdBy) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const removeList = memberIds
      .map(toStrId)
      .filter(mid => mid && mid !== toStrId(g.createdBy));

    if (removeList.length) {
      await Group.updateOne({ _id: id }, { $pull: { members: { $in: removeList } } });
    }

    const populated = await Group.findById(id)
      .populate('advisor', '_id username email role fullName studentId')
      .populate('members', '_id username email role fullName studentId')
      .lean();

    res.json(populated);
  } catch (e) { next(e); }
};
