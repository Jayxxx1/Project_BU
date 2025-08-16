import Group from '../models/Group.js';
import User from '../models/User.js';

const isTeacher = async (id) => {
  const u = await User.findById(id).select('_id role');
  return !!u && u.role === 'teacher';
};

export const createGroup = async (req, res) => {
  const { name, description, advisorId, memberIds=[] } = req.body;
  if (!name || !advisorId) return res.status(400).json({ message: 'name & advisorId required' });
  if (!await isTeacher(advisorId)) return res.status(400).json({ message: 'advisorId must be a teacher' });

  const members = [...new Set([req.user.id, ...memberIds])];
  const doc = await Group.create({
    name: name.trim(),
    description: (description || '').trim(),
    advisor: advisorId,
    members,
    createdBy: req.user.id,
  });
  const populated = await doc.populate([
    { path: 'advisor', select: '_id username email role' },
    { path: 'members', select: '_id username email role' },
  ]);
  res.status(201).json(populated);
};

export const listMyGroups = async (req, res) => {
  const items = await Group.find({ members: req.user.id, status: 'active' })
    .sort({ createdAt: -1 })
    .populate([
      { path: 'advisor', select: '_id username email role' },
      { path: 'members', select: '_id username email role' },
    ]);
  res.json(items);
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const g = await Group.findById(id);
  if (!g) return res.status(404).json({ message: 'Group not found' });
  if (String(g.createdBy) !== String(req.user.id) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  const { name, description, advisorId, status, memberIds } = req.body;
  if (name) g.name = name;
  if (description !== undefined) g.description = description;
  if (status) g.status = status;
  if (advisorId) {
    if (!await isTeacher(advisorId)) return res.status(400).json({ message: 'advisorId must be a teacher' });
    g.advisor = advisorId;
  }
  if (Array.isArray(memberIds)) g.members = memberIds;
  await g.save();

  const populated = await g.populate([
    { path: 'advisor', select: '_id username email role' },
    { path: 'members', select: '_id username email role' },
  ]);
  res.json(populated);
};

export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const g = await Group.findById(id);
  if (!g) return res.status(404).json({ message: 'Group not found' });
  if (String(g.createdBy) !== String(req.user.id) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  await g.deleteOne();
  res.json({ message: 'Deleted' });
};
