import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    academicYear: "",
    advisorId: "",
    files: [],
  });

  useEffect(() => {
    (async () => {
      const data = await projectService.get(id);
      setProject(data);
      setForm({
        name: data.name,
        description: data.description || "",
        academicYear: data.academicYear || "",
        advisorId: data.advisor?._id || "",
        files: data.files || [],
      });
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await projectService.update(id, {
      name: form.name,
      description: form.description,
      advisorId: form.advisorId,
      files: form.files,
    });
    setEditMode(false);
    const updated = await projectService.get(id);
    setProject(updated);
  };

  if (!project) return <p>กำลังโหลด...</p>;

  return (
    <div className="p-6">
      {!editMode ? (
        <>
          <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
          <p className="mb-2">รายละเอียด: {project.description || "—"}</p>
          <p className="mb-2">ปีการศึกษา: {project.academicYear}</p>
          <p className="mb-2">อาจารย์ที่ปรึกษา: {project.advisor?.fullName || project.advisor?.email}</p>
          <h3 className="mt-4 font-semibold">สมาชิก:</h3>
          <ul>
            {project.members.map((m) => (
              <li key={m._id}>{m.fullName || m.username || m.email}</li>
            ))}
          </ul>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setEditMode(true)}
          >
            แก้ไขโปรเจ็กต์
          </button>
        </>
      ) : (
        // แบบฟอร์มแก้ไข
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>ชื่อโปรเจ็กต์</label>
            <input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full" />
          </div>
          <div>
            <label>รายละเอียด</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" />
          </div>
          <div>
            <label>ปีการศึกษา</label>
            <input name="academicYear" value={form.academicYear} onChange={handleChange} className="border p-2 w-full" disabled />
          </div>
          {/* เพิ่มส่วนแก้ไขอาจารย์ที่ปรึกษาหรือสมาชิกตามความต้องการ */}
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">บันทึก</button>
          <button type="button" className="ml-2 px-4 py-2 bg-gray-300 rounded" onClick={() => setEditMode(false)}>ยกเลิก</button>
        </form>
      )}
    </div>
  );
}
