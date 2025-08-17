import express from 'express';
import { protect } from '../middleware/AuthMiddleware.js';
import {
  createGroup,
  listMyGroups,
  updateGroup,
  deleteGroup,
  searchUsers,
  addMembers,
  removeMembers,
} from '../controllers/groupController.js';

const router = express.Router();
router.use(protect);

// ดึงกลุ่มที่เกี่ยวข้องกับฉัน 
router.get('/mine', listMyGroups);

// สร้าง/แก้ไข/ลบกลุ่ม
router.post('/', createGroup);
router.patch('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// ค้นหา user เพื่อเพิ่มสมาชิก 
router.get('/search-users', searchUsers);

// จัดการสมาชิก
router.patch('/:id/members/add', addMembers);
router.patch('/:id/members/remove', removeMembers);

export default router;
