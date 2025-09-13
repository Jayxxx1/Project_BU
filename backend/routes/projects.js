import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createProject,
  listProjects,
  listMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  searchUsers,
  addMembers,
  removeMembers,
} from '../controllers/projectController.js';

const router = express.Router();

// ต้องล็อกอินก่อนใช้งานทุก endpoint
router.use(protect);

// รายการโปรเจคทั้งหมด (admin / หรือใช้ในการแสดงทั้งหมด)
router.get('/', listProjects);

// รายการโปรเจคของฉัน (เป็นสมาชิก เป็นผู้สร้าง หรือเป็น advisor)
router.get('/mine', listMyProjects);

// สร้างโปรเจคใหม่
router.post('/', createProject);

// ค้นหา user เพื่อเพิ่มสมาชิก (ส่ง query string q, role, academicYear, excludeProject, excludeIds)
router.get('/search-users', searchUsers);

// เพิ่ม/ลบสมาชิก
router.patch('/:id/members/add', addMembers);
router.patch('/:id/members/remove', removeMembers);

// ดึงโปรเจคตาม ID
router.get('/:id', getProjectById);

// แก้ไขโปรเจค
router.patch('/:id', updateProject);

// ลบโปรเจค
router.delete('/:id', deleteProject);

export default router;