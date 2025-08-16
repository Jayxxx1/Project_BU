import express from "express";
import bcrypt from "bcryptjs";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();
router.use(protect, requireRole("admin"));

// GET /api/admin/teachers
router.get("/teachers", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const cond = { role: "teacher" };
    if (q) {
      cond.$or = [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    const list = await User.find(cond).select("_id username email role").lean();
    res.json(list);
  } catch (e) { next(e); }
});

// POST /api/admin/teachers
router.post("/teachers", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "กรอกข้อมูลให้ครบ" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "อีเมลนี้ถูกใช้แล้ว" });
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ username, email, password: hash, role: "teacher" });
    res.status(201).json({ _id: u._id, username: u.username, email: u.email, role: u.role });
  } catch (e) { next(e); }
});

export default router;
