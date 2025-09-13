import React, { useState } from 'react';
<<<<<<< HEAD
import { NavLink , useNavigate , useLocation , Link } from 'react-router-dom';
import { AiFillPlusCircle, AiFillCalendar, AiFillHome } from "react-icons/ai";
import { MdSummarize, MdGroup } from "react-icons/md";
import { Users as UsersIcon} from 'lucide-react';
import { IoMdInformationCircleOutline , } from "react-icons/io";
import {useAuth} from '../contexts/AuthContext';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user && user.role === 'admin';
  
  const navItems = [
    { name: 'หน้าแรก', path: '/maincontent', icon: <AiFillHome className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-blue-500 to-cyan-500' },
=======
import { NavLink , useNavigate , useLocation } from 'react-router-dom';
import { AiFillPlusCircle, AiFillCalendar, AiFillHome } from "react-icons/ai";
import { MdSummarize, MdGroup } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {useAuth} from '../contexts/AuthContext';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth(); // ดึง logout จาก useAuth
  const navigate = useNavigate();
  const location = useLocation(); // เพิ่ม useLocation เพื่อใช้ในการตรวจสอบ path

  const navItems = [
    { name: 'หน้าแรก', path: '/', icon: <AiFillHome className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-blue-500 to-cyan-500' },
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
    { name: 'นัดหมายของฉัน', path: '/appointments', icon: <AiFillCalendar className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-purple-500 to-pink-500' },
    { name: 'สร้างนัดหมาย', path: '/appointments/create', icon: <AiFillPlusCircle className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-green-500 to-emerald-500' },
    { name: 'สรุปการประชุม', path: '/meetsummary', icon: <MdSummarize className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-orange-500 to-amber-500' },
    { name: 'โปรเจคของฉัน', path: '/projects', icon: <MdGroup className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-indigo-500 to-purple-500' },
    { name: 'เกี่ยวกับ', path: '/about', icon: <IoMdInformationCircleOutline className="text-xl md:text-2xl lg:text-2xl" />, color: 'from-gray-500 to-slate-500' },
<<<<<<< HEAD
    { name: 'เมนูแอดมิน', path: '/admin', icon: <UsersIcon className="w-5 h-5" />, color: 'from-purple-500 to-pink-500', requiresAdmin: true },
  ];
  
  // กรอง navItems โดยใช้ .filter()
  const filteredNavItems = navItems.filter(item => {
    // ถ้าเมนูต้องการสิทธิ์ admin (item.requiresAdmin เป็น true) แต่ผู้ใช้ไม่ใช่ admin
    // ให้กรองเมนูนั้นออกไป (return false)
    if (item.requiresAdmin && !isAdmin) {
      return false;
    }
    // สำหรับเมนูอื่นๆ หรือเมนู admin ที่ผู้ใช้มีสิทธิ์ ให้แสดงผลตามปกติ (return true)
    return true;
  });

  const handleLogout = () => {
=======
  ];
  
  const handleLogout=()=>{
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
    logout();
    navigate('/login');
    toggleSidebar();
  }

  return (
    <>
      {/* Mobile Sidebar (Overlay) */}
      <aside
        className={`fixed top-0 left-0 min-h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-30
          flex flex-col transition-transform duration-300 ease-in-out
          w-72
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden
        `}
      >
        {/* Mobile Sidebar Header */}
        <div className="flex items-center p-6 border-b border-gray-200/50 justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <img src="./logo/logo2.png" alt="Logo" className="w-12 h-12 relative z-10 drop-shadow-lg" />
            </div>
            <div className="ml-3 text-sm font-bold text-gray-800 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Online Appointment<br />
                Meeting System
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-grow mt-6 px-3">
          <ul className="space-y-2">
<<<<<<< HEAD
            {/* ใช้ filteredNavItems แทน navItems */}
            {filteredNavItems.map((item, index) => (
=======
            {navItems.map((item, index) => (
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
              <li key={item.name} className="transform transition-all duration-200">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center py-3 px-4 text-gray-700 rounded-xl transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/25 scale-105` 
                      : 'hover:bg-gray-50 hover:scale-105 hover:shadow-md'
                    }`
                  }
                  onClick={toggleSidebar}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className={`mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    location.pathname === item.path ? 'animate-bounce' : ''
                  }`}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium">
                    {item.name}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
<<<<<<< HEAD
=======

        {/* Mobile Logout button */}
        {/* <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-red-50/50 to-pink-50/50">
          <button 
            onClick={handleLogout}
            className="group flex items-center py-3 px-4 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white rounded-xl transition-all duration-300 w-full hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
          >
            <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 013-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div> */}
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 min-h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-30
          transition-[width] duration-700 ease-in-out fixed top-0 left-0
          ${isSidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        {/* Desktop Sidebar Header */}
        <div className={`flex items-center border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 transition-[padding] duration-700
          ${isSidebarOpen ? 'p-6' : 'p-4 justify-center'}
        `}>
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white-400 to-blue-500 rounded-full blur-lg opacity-10 animate-pulse"></div>
<<<<<<< HEAD
            <Link
            to ="/"
            onClick={toggleSidebar}
            className='flex items-center gap-2 hover:opacity-90 transition'
            >
            <img src="/logo/logo2.png" alt="Logo" className={`relative z-10 drop-shadow-lg transition-all duration-300 rounded-xl ${isSidebarOpen ? 'w-14 h-14' : 'w-12 h-12'}`} />
          </Link>
=======
            <img src="/logo/logo2.png" alt="Logo" className={`relative z-10 drop-shadow-lg transition-all duration-300 rounded-xl ${isSidebarOpen ? 'w-14 h-14' : 'w-12 h-12'}`} />
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
          </div>
          
          {isSidebarOpen && (
            <div className="ml-4 text-sm font-bold text-gray-800 leading-tight animate-fade-in-delayed">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                Online Appointment<br />
                Meeting System
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="flex-grow mt-6 px-3">
          <ul className="space-y-2">
<<<<<<< HEAD
            {/* ใช้ filteredNavItems แทน navItems */}
            {filteredNavItems.map((item, index) => (
=======
            {navItems.map((item, index) => (
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
              <li key={item.name} className="transform transition-all duration-200">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center py-4 px-4 text-gray-700 rounded-xl transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/25 scale-105` 
                      : 'hover:bg-gray-50 hover:scale-105 hover:shadow-md'
                    }
                    ${isSidebarOpen ? 'justify-start' : 'justify-center'}`
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className={`${isSidebarOpen ? 'mr-4' : ''} flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    location.pathname === item.path ? 'animate-bounce-icon' : ''
                  }`}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className="whitespace-nowrap text-base font-medium animate-slide-in-delayed">
                      {item.name}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
<<<<<<< HEAD
=======

        {/* Desktop Logout button */}
        {/* <div className={`p-4 border-t border-gray-200/50 ${isSidebarOpen ? 'flex-col items-center' : 'flex justify-center'}`}>
          <button
            onClick={toggleSidebar}
            className="group flex items-center justify-center p-3 text-gray-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {isSidebarOpen && (
              <span className="ml-2 font-medium animate-fade-in-delayed">ยุบเมนู</span>
            )}
          </button>
          
          {/* {isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-4 group flex items-center justify-center py-3 px-4 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white rounded-xl transition-all duration-300 w-full hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 animate-fade-in-delayed"
            >
              <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 013-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="font-medium">ออกจากระบบ</span>
            </button>
          )} */} 
        {/* </div> */}
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
      </aside>

      <style jsx>{`
        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-delayed {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounce-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out 0.2s forwards;
          animation-fill-mode: both;
        }
        
        .animate-slide-in-delayed {
          animation: slide-in-delayed 0.4s ease-out 0.3s forwards;
          animation-fill-mode: both;
        }

        .animate-bounce-icon {
          animation: bounce-icon 1s infinite;
        }
      `}</style>
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 344b4826afa36497c6b49280dcd6663142fd9374
