import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,    
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
<<<<<<< HEAD
import { requireRole } from "../middleware/authMiddleware.js";
=======
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374

const router = express.Router();

// ต้องล็อกอินก่อน (ไม่จำกัด role)
router.use(protect);

//  (หน้าแรกต้องการ)
<<<<<<< HEAD
// Only admin can retrieve all appointments
router.get("/all", requireRole('admin'), getAllAppointments);
=======
router.get("/all", getAllAppointments);
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374

// รายการของฉัน
router.get("/", getMyAppointments);

// รายการเดี่ยว (detail)
router.get("/:id", getAppointmentById);

// สร้าง/แก้ไข/ลบ
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
