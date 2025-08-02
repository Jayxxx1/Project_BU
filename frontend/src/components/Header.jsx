import { useState } from 'react';
import { Link , useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

export default function Header({ isSidebarOpen, toggleSidebar }) { 
  const [searchValue, setSearchValue] = useState('');
  const {isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout =()=>{
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center w-full">
        
        {/* Hamburger Menu Button - แสดงเฉพาะบน Mobile (md:hidden) */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-200 rounded-md transition-colors duration-200 flex-shrink-0 " // เพิ่ม md:hidden
          title={isSidebarOpen ? "ยุบ Sidebar" : "ขยาย Sidebar"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.7} 
            stroke="currentColor" 
            className="size-6 text-gray-600" 
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>

        {/* Search Bar - ปรับปรุงโครงสร้างและ Responsive */}
        {/* ใช้ ml-auto เพื่อดัน Right Side ไปขวาสุด */}
        <div className="relative   flex-grow  mx-2 sm:mx-4 hidden md:block max-w-sm lg:max-w-md ml-auto"> {/* เพิ่ม ml-auto */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="block w-full pl-10 pr-6 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="ค้นหาอาจารย์ กลุ่ม นัดหมาย..."
          />
        </div>

        {/* Right Side - User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 ml-auto"> {/* เพิ่ม ml-4 เพื่อให้มีระยะห่างจาก Search Bar */}
          {/* Language Selector - ซ่อนบนมือถือเล็กๆ */}
          <div className="  relative  sm:block">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-2 py-1 sm:px-3 sm:py-2 pr-6 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>TH</option>
              <option>EN</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-1 sm:px-2 pointer-events-none">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>

          {/* Notification Bell */}
          <button className="relative p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:-top-1 sm:-right-1 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
          </button>

          {isAuthenticated ? (
            // ถ้าล็อกอินแล้ว 
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 text-sm md:text-base hidden sm:block">
                สวัสดี, <strong className="font-semibold">{user?.username}</strong>
              </span>
              <button
                onClick={logout}
                className="bg-red-500 shadow-xl shadow-red-500/50 hover:bg-red-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-sm transition-colors duration-200"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            // ถ้ายังไม่ล็อกอิน
            <div className="flex space-x-1 sm:space-x-4">
              <Link
                to="/login"
                className="bg-cyan-500 shadow-xl shadow-cyan-500/50 hover:bg-cyan-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-sm transition-colors duration-200"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 shadow-xl shadow-blue-600/50 hover:bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-sm transition-colors duration-200"
              >
                ลงทะเบียน
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
