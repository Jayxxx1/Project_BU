import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainContent from "./components/MainContent";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppointmentsPages from "./pages/AppointmentsPages.jsx";
import CreateAppointment from "./pages/CreateAppointments.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MeetSumPage from "./pages/MeetSumPage.jsx";
import ProjectsPage from "./pages/ProjectPage.jsx";
import AboutPages from "./pages/AboutPage.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminRoute from "./components/AdminRoutes";
// detail pages (ในโปรเจ็กต์ของคุณอยู่ใน components)
import ProjectDetail from "./components/ProjectDetail.jsx";
import AppointmentDetail from "./components/AppointmentDetail.jsx";

export default function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* routes under Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<MainContent />} />
        <Route path="about" element={<AboutPages />} />

        {/* appointments */}
        <Route
          path="appointments"
          element={
            <ProtectedRoute>
              <AppointmentsPages />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments/create"
          element={
            <ProtectedRoute>
              <CreateAppointment />
            </ProtectedRoute>
          }
        />
        {/* ✅ เปลี่ยนเป็นมาตรฐาน UI: /appointments/:id */}
        <Route
          path="appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetail />
            </ProtectedRoute>
          }
        />

        {/* projects (คงตามเดิมเพื่อไม่ให้ลิงก์อื่นพัง) */}
        <Route
          path="projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/create"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/details/:id"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="meetsummary"
          element={
            <ProtectedRoute>
              <MeetSumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
