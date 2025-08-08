import { useState } from 'react';
import { NavLink , useNavigate } from 'react-router-dom';
import { AiFillPlusCircle, AiFillCalendar, AiFillHome } from "react-icons/ai";
import { MdSummarize, MdGroup } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {useAuth} from '../contexts/AuthContext';


export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const {isAuthenticated,lougut,user}=useAuth();
  const navigate = useNavigate();
  const {logout}=useAuth();


  const navItems = [
    { name: 'หน้าแรก', path: '/', icon: <AiFillHome className="text-xl md:text-2xl lg:text-2xl" /> },
    { name: 'นัดหมายของฉัน', path: '/appointments', icon: <AiFillCalendar className="text-xl md:text-2xl lg:text-2xl" /> },
    { name: 'สร้างนัดหมาย', path: '/appointments/create', icon: <AiFillPlusCircle className="text-xl md:text-2xl lg:text-2xl" /> },
    { name: 'สรุปการประชุม', path: '/meetsummary', icon: <MdSummarize className="text-xl md:text-2xl lg:text-2xl" /> },
    { name: 'กลุ่มของฉัน', path: '/groups', icon: <MdGroup className="text-xl md:text-2xl lg:text-2xl" /> },
    { name: 'เกี่ยวกับ', path: '/about', icon: <IoMdInformationCircleOutline className="text-xl md:text-2xl lg:text-2xl" /> },
  ];
  
  const handleLogout=()=>{
    logout();
    navigate('/login');
    toggleSidebar();
  }

  return (
    <>
      {/* Mobile Sidebar (Overlay) - แสดงเฉพาะบน Mobile (md:hidden) */}
      <aside
        className={`fixed top-0 left-0 min-h-screen bg-white border-r border-gray-200 shadow-lg z-30 // เปลี่ยน h-full เป็น min-h-screen
          flex flex-col transition-transform duration-300
          w-64 // Fixed width for mobile overlay
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden // Hide this sidebar on desktop
        `}
      >
        {/* Mobile Sidebar Header (Logo + System Name + Close Button) */}
        <div className="flex items-center p-6 border-b border-gray-200 justify-between">
          <div className="flex items-center"> {/* Group logo and text */}
            <div className="flex-shrink-0">
              <img src="./logo/logo1.png" alt="Logo" className="w-12 h-12" /> {/* Mobile logo size */}
            </div>
            <div className="ml-3 text-sm font-semibold text-gray-800 leading-tight whitespace-nowrap">
              Online Appointment and<br />
              Meeting Record System
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-grow mt-5">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-6 text-gray-700 hover:bg-gray-100 rounded-lg mx-3 transition-colors duration-200 ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : ''} justify-start`
                  }
                  onClick={toggleSidebar} // Close sidebar on mobile when link is clicked
                >
                  <span className="mr-3 flex-shrink-00">{item.icon}</span>
                  <span className="whitespace-nowrap text-sm">{item.name}</span> {/* Mobile text size */}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Logout button */}
        <div className="p-6 border-t border-gray-200 flex justify-start">
          <button onClick={handleLogout}
           className="flex items-center py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 013-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar - แสดงเฉพาะบน Desktop (hidden md:flex) */}
      <aside
        className={`hidden md:flex   flex-col flex-shrink-0 min-h-screen bg-white border-r border-gray-200 shadow-lg z-30
          transition-all duration-700
          ${isSidebarOpen ? 'w-70' : 'w-25'} // Desktop width based on state
        `}
      >
        {/* Desktop Sidebar Header (Logo + System Name + Toggle Button) */}
        <div className={`flex items-center border-b border-gray-200
          ${isSidebarOpen ? 'p-6' : 'p-6'} // Adjust padding based on sidebar state
        `}>

          <>
            <div className="flex-shrink-0">
              <img src="/logo/logo1.png" alt="Logo" className="w-16 h-16" /> {/* Desktop logo size */}
            </div>

          </>

          {isSidebarOpen && (
            <div className="ml-3 text-sm font-semibold text-gray-800 leading-tight whitespace-nowrap text-base">
              Online Appointment and<br />
              Meeting Record System
            </div>
          )}
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="flex-grow mt-5">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-6 text-gray-700 hover:bg-gray-100 rounded-lg mx-3 transition-colors duration-200 ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : ''} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`
                  }
                >
                  <span className={`${isSidebarOpen ? 'mr-3' : ''} flex-shrink-0`}>{item.icon}</span>
                  {isSidebarOpen && (
                    <span className="whitespace-nowrap text-lg"> {/* Desktop text size */}
                      {item.name}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

       
        {/* {isAuthenticated ? (
        <div className={`p-6 border-t border-gray-200 ${isSidebarOpen ? 'justify-start' : 'justify-center'} flex`}>
          <button
          onClick={handleLogout} 
           className={`flex items-center py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <svg className={`w-5 h-5 ${isSidebarOpen ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 013-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            {isSidebarOpen && <span>ออกจากระบบ</span>}
          </button>
        </div> 
        ) : null} */}
      </aside>
    </>
  );
}
