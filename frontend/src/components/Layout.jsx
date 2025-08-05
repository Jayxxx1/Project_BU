import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  // กำหนดสถานะเริ่มต้นของ Sidebar:
  // ให้เปิด (true) เสมอเมื่อ Component ถูก Mount
  // จากนั้น useEffect จะปรับให้ปิด (false) ถ้าเป็น Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);

    const initialCheckTimeout = setTimeout(handleResize, 0);

    // Cleanup function: ลบ Event Listener เมื่อ Component ถูก unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(initialCheckTimeout); // Clear timeout on unmount
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar component: จะอยู่ fixed ที่ด้านซ้ายมือ */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/*
        Overlay สำหรับ Mobile:
        จะปรากฏขึ้นเมื่อ Sidebar เปิดอยู่ (isSidebarOpen) และหน้าจอเป็น Mobile (md:hidden)
        เมื่อคลิกที่ Overlay นี้ Sidebar จะปิด
        เราเปลี่ยน bg-black bg-opacity-50 เป็น bg-transparent เพื่อไม่ให้เนื้อหาดำ
      */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent z-20 md:hidden" // เปลี่ยนเป็น bg-transparent
          onClick={toggleSidebar}
        ></div>
      )}

      {/*
        Main content area:
        นี่คือส่วนที่จะมี Header และเนื้อหาหลักของแต่ละหน้า (Outlet)
        เราจะกำหนด margin-left ให้กับ div นี้ เพื่อให้มันไม่ทับกับ Sidebar
        และทำให้ margin นี้ responsive ด้วย Tailwind CSS breakpoints

        - บนหน้าจอขนาดเล็ก (ค่าเริ่มต้น): margin-left จะเป็น 0 (ml-0)
          เพราะ Sidebar จะเป็น Overlay (ทับเนื้อหา) บนมือถือ
        - บนหน้าจอขนาดกลาง (md) ขึ้นไป: margin-left จะถูกกำหนดตามความกว้างของ Sidebar
          (ml-72 เมื่อเปิด, ml-20 เมื่อปิด)
        - 'transition-all duration-300' เพื่อให้การเปลี่ยน margin ดูราบรื่น
      */}
      <div
        className={`flex flex-col flex-grow transition-all duration-300
        md:${isSidebarOpen ? "ml-72" : "ml-20"}`}
      >
        {/* Header component: จะอยู่ด้านบนของ Main content area */}
        {/* ส่ง toggleSidebar ไปให้ Header ด้วย เพื่อให้ Header มีปุ่ม Hamburger สำหรับ Mobile */}
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Outlet: จุดที่ Component ลูกของ Nested Route จะถูก Render */}
        <Outlet />
      </div>
    </div>
  );
}
