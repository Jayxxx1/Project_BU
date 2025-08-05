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
import GroupPage from "./pages/GroupPage.jsx";
import AboutPages from "./pages/AboutPage.jsx";

export default function App() {
  return (
    <Routes>
      {/*public routes*/}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* public sidebar routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<MainContent />} />
        <Route path="/about" element={<AboutPages />} />
      </Route>

      {/* protect routes */}
      <Route path="/" element={<Layout />}>
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
        <Route
          path="meetsummary"
          element={
            <ProtectedRoute>
              <MeetSumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="groups"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* <Route path="*" component={NotFound} /> */}
    </Routes>
  );
}
