// import express from 'express';
// import { protect } from '../middleware/authMiddleware.js';
// import {
//   createAppointment,
//   getAppointments,
//   getAppointmentById,
//   updateAppointment,
//   deleteAppointment
// } from '../controllers/appointmentController.js';

// const router = express.Router();

// // สร้างนัดหมายใหม่
// router.post('/', protect, createAppointment);
// // ดึงรายการนัดหมายของผู้ใช้
// router.get('/', protect, getAppointments);
// // ดึงนัดหมายตาม ID
// router.get('/:id', protect, getAppointmentById);
// // อัปเดตนัดหมาย (เช่น เลื่อนหรือยกเลิก)
// router.put('/:id', protect, updateAppointment);
// // ลบนัดหมาย (สำหรับ Admin หรือเจ้าของ)
// router.delete('/:id', protect, deleteAppointment);

// export default router;