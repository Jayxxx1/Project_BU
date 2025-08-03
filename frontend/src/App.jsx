import React from "react";
import { Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import MainContent from "./components/MainContent";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppointmentsPages from './pages/AppointmentsPages';
import CreateAppointmentPages from "./pages/CreateAppointmentPages.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MeetSummaryPages from "./pages/MeetSumPages.jsx";
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
            
              <AppointmentsPages />
            
          }
        />
        {/* <Route
          path="appointments/create"
          element={
            <ProtectedRoute>
              <CreateAppointmentsPages />
            </ProtectedRoute>
          }
        /> */}
      {/* <Route
        path="meetsummary"
        element={<ProtectedRoute>
          <MeetSummaryPage />
        </ProtectedRoute>
        }
      /> */}
      <Route path="/" element={<Layout />}></Route>
      <Route
        path="groups"
        element={<ProtectedRoute>
          <meetsummaryPages />
        </ProtectedRoute>
        }
      />

      {/* เพิ่ม Protected Routes อื่นๆ ที่นี่ ที่คุณต้องการให้ Login เท่านั้นที่เข้าได้ */}
      {/* <Route path="meetsummary" element={<ProtectedRoute><MeetSummaryPage /></ProtectedRoute>} /> */}
      {/* <Route path="groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} /> */}
    </Route>

      {/* (Optional) Route สำหรับจัดการ Path ที่ไม่ตรงกับ Route ใดๆ (เช่น 404 Not Found) */ }
  {/* <Route path="*" element={<NotFoundPage />} /> */ }
    </Routes >
  );
}