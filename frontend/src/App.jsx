import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainContent from "./components/MainContent.jsx";
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
import AdminLayout from "./components/AdminLayout.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage.jsx";
import AdminProjectsPage from "./pages/AdminProjectsPage.jsx";
// detail pages (ในโปรเจ็กต์ของคุณอยู่ใน components)
import ProjectDetail from "./components/ProjectDetail.jsx";
import AppointmentDetail from "./components/AppointmentDetail.jsx";

export default function App() {
  return (
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPages/>}/>

      {/* Admin area: separate layout and routes for administrators */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
      </Route>

      {/* app under Layout (ทุกอย่างยกเว้น '/') */}
      <Route path="/" element={<Layout />}>
      <Route path="/" element={<MainContent />} />

        <Route
          path="appointments"
          element={<ProtectedRoute><AppointmentsPages /></ProtectedRoute>}
        />
        <Route
          path="appointments/create"
          element={<ProtectedRoute><CreateAppointment /></ProtectedRoute>}
        />
        <Route
          path="appointments/:id"
          element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>}
        />
        <Route
          path="projects"
          element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>}
        />
        <Route
          path="projects/create"
          element={<ProtectedRoute><CreateProject /></ProtectedRoute>}
        />
        <Route
          path="projects/details/:id"
          element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>}
        />
        <Route
          path="meetsummary"
          element={<ProtectedRoute><MeetSumPage /></ProtectedRoute>}
        />
      </Route>
    </Routes>
  );
}
