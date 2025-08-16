import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Group from "../models/Group.js";

const router = express.Router();
router.use(protect);

// GET /api/groups/mine
router.get("/mine", async (req, res, next) => {
  try {
    const uid = req.user._id;
    const groups = await Group.find({ $or: [{ members: uid }, { advisor: uid }] })
      .populate("advisor", "username email")
      .populate("members", "username email")
      .lean();
    res.json(groups);
  } catch (e) { next(e); }
});

// POST /api/groups
router.post("/", async (req, res, next) => {
  try {
    const { name, description = "", advisorId } = req.body;
    if (!name || !advisorId) return res.status(400).json({ message: "กรอกชื่อกลุ่มและเลือกอาจารย์" });
    const g = await Group.create({
      name: name.trim(),
      description: description.trim(),
      advisor: advisorId,
      members: [req.user._id],
    });
    const full = await Group.findById(g._id)
      .populate("advisor", "username email")
      .populate("members", "username email")
      .lean();
    res.status(201).json(full);
  } catch (e) { next(e); }
});

export default router;
