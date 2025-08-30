import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.use(protect);

// รายการของฉัน
router.get("/", getMyAppointments);

// ✅ มาตรฐาน REST: รายการเดียวใช้ /:id (ลบ/เลิกใช้ /detail/:id)
router.get("/:id", getAppointmentById);

// สร้าง/แก้ไข/ลบ
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
