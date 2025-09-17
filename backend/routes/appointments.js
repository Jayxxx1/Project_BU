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

import { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ต้องล็อกอินก่อน 
router.use(protect);

// Endpoint to list all appointments across the system.  Restrict to admin users only to prevent information leakage.
router.get("/all", requireRole('admin'), getAllAppointments);

// รายการของฉัน
router.get("/", getMyAppointments);

// รายการเดี่ยว (detail)
router.get("/:id", getAppointmentById);

// สร้าง/แก้ไข/ลบ
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
