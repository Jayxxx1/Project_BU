import express from "express";
import bcrypt from "bcryptjs";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ต้องล็อกอินและเป็น admin เท่านั้น
router.use(protect, requireRole("admin"));

/** ================= USERS (ทั้งหมด) =================
 * GET /api/admin/users?q=&role=
 */
router.get("/users", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const role = (req.query.role || "").trim();

    const cond = {};
    if (role && ["admin", "teacher", "student"].includes(role)) cond.role = role;
    if (q) {
      const re = new RegExp(q, "i");
      cond.$or = [{ username: re }, { email: re }, { fullName: re }];
    }

    const list = await User.find(cond)
      .select("_id username email role fullName studentId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(list);
  } catch (e) { next(e); }
});
router.delete("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const u = await User.findById(id);
    if (!u) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    // กันลบผู้ดูแลระบบ
    if (u.role === "admin") {
      return res.status(400).json({ message: "ไม่อนุญาตให้ลบผู้ดูแลระบบ" });
    }

    await u.deleteOne();
    res.json({ message: "ลบผู้ใช้แล้ว" });
  } catch (e) {
    next(e);
  }
});
/** POST /api/admin/users
 * body: { username, email, password, role, fullName?, studentId? }
 */
router.post("/users", async (req, res, next) => {
  try {
    const { username, email, password, role, fullName, studentId } = req.body || {};
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "กรอกข้อมูลให้ครบ (username, email, password, role)" });
    }
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "role ไม่ถูกต้อง" });
    }
    if (role === "student" && !studentId) {
      return res.status(400).json({ message: "role=student ต้องกรอก studentId" });
    }

    const dup = await User.findOne({ $or: [{ username }, { email }] });
    if (dup) return res.status(409).json({ message: "username หรือ email ถูกใช้แล้ว" });

    if (role === "student" && studentId) {
      const dupStu = await User.findOne({ studentId });
      if (dupStu) return res.status(409).json({ message: "รหัสนักศึกษาไม่สามารถซ้ำได้ !" });
    }

    const hash = await bcrypt.hash(password, 10);
    const doc = await User.create({
      username,
      email,
      password: hash,
      role,
      fullName: fullName || "",
      studentId: role === "student" ? studentId : undefined,
    });

    res.status(201).json({
      _id: doc._id,
      username: doc.username,
      email: doc.email,
      role: doc.role,
      fullName: doc.fullName || "",
      studentId: doc.studentId || undefined,
      createdAt: doc.createdAt,
    });
  } catch (e) { next(e); }
});

/** ================= TEACHERS (ของเดิม) =================
 * GET /api/admin/teachers?q=
 */
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

/** POST /api/admin/teachers (ของเดิม) */
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
router.patch("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    // กันแก้ role เป็นค่าที่ไม่ถูกต้อง
    if (updates.role && !["admin", "teacher", "student"].includes(updates.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // กันแก้ studentId ซ้ำ
    if (updates.studentId) {
      const dupStu = await User.findOne({ studentId: updates.studentId, _id: { $ne: id } });
      if (dupStu) return res.status(409).json({ message: "รหัสนักศึกษาไม่สามารถซ้ำได้ !" });
    }

    // ถ้าอัปเดรหัสผ่าน
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select("_id username email role fullName studentId createdAt");

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
