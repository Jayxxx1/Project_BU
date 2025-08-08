import {
  RiCalendarScheduleLine,
  RiCollapseDiagonal2Fill,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import React from "react";
export default function MainContent() {
  const navigate = useNavigate();
  return (
    <div className="flex-grow p-6 bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-medium mb-4">ยินดีต้อนรับ! STD_01</h1>
          <p className="text-lg mb-6 text-blue-100">
            ระบบบันทึกข้อมูลนัดหมายการรักษาออนไลน์ที่ช่วยให้คุณ
            <br />
            สามารถบันทึกข้อมูลการรักษาได้อย่างง่ายดายและรวดเร็ว
            และสามารถค้นหาข้อมูลผู้ป่วยได้อย่างสะดวกและรวดเร็ว
          </p>
          <button
            onClick={() => navigate("/appointments/create")}
            className="bg-cyan-500 shadow-xl shadow-cyan-500/50 hover:bg-cyan-400 text-white px-6 py-3 rounded-full font-medium
    transition-all duration-200 backdrop-blur-sm  flex items-center justify-center space-x-1.5"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="5 0 16 20">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>สร้างนัดหมายใหม่</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">นัดหมายวันนี้</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">ผู้ป่วยทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">48</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1-1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">การประชุมเสร็จสิ้น</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          นัดหมายล่าสุด
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">
                  นัดหมาย พบหาเพื่อวิเคราะห์ POC
                </p>
                <p className="text-sm text-gray-500">
                  วันที่ 5 ธ.ค. 2568 เวลา 10:00 น.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              รอตรวจ
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">
                  นัดหมาย พบหาเพื่อวิเคราะห์ P11
                </p>
                <p className="text-sm text-gray-500">
                  วันที่ 7 ธ.ค. 2568 เวลา 14:00 น.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              อนุมัติ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
