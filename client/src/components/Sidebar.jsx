import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'แดชบอร์ด',
      icon: '📊',
      adminOnly: true,
    },
    {
      path: '/employees',
      name: 'จัดการพนักงาน',
      icon: '👥',
      adminOnly: true,
    },
    {
      path: '/attendance',
      name: 'บันทึกเข้าออกงาน',
      icon: '📋',
      adminOnly: true,
    },
    {
      path: '/report',
      name: 'รายงาน',
      icon: '📈',
      adminOnly: true,
    },
    {
      path: '/',
      name: 'สแกนใบหน้า',
      icon: '📷',
      adminOnly: false,
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin())
  );

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">🕐</span>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold">เวลาเข้างาน</h2>
            <p className="text-sm text-gray-300">Face Recognition</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {user?.name || 'ผู้ใช้งาน'}
            </p>
            <p className="text-xs text-gray-400">
              {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงาน'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats (สำหรับแอดมิน) */}
      {isAdmin() && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">สถิติด่วน</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">เข้างานวันนี้</span>
              <span className="text-green-400 font-medium">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ยังไม่เข้างาน</span>
              <span className="text-red-400 font-medium">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">พนักงานทั้งหมด</span>
              <span className="text-blue-400 font-medium">-</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Face Attendance System v1.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
