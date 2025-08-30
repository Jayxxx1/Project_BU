/*
 * ไฟล์ groups.js นี้ถูกแทนที่ด้วย projects.js
 * ระบบไม่ได้ใช้ /api/groups อีกต่อไป
 * คงไว้เพื่อความเข้ากันได้ แต่ตอบกลับแจ้งว่า endpoint นี้ย้ายไปแล้ว
 */
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.use(protect);

// redirect or notify that groups endpoints are deprecated
router.all('*', (req, res) => {
  res.status(410).json({ message: 'Endpoint /api/groups ถูกย้ายไป /api/projects แล้ว' });
});

export default router;
