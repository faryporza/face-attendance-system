import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // โหลดข้อมูลพร้อมกัน
      const [employeesResponse, attendanceResponse, statsResponse] = await Promise.all([
        employeeService.getAllEmployees(),
        attendanceService.getAllAttendance({ limit: 10 }),
        attendanceService.getAttendanceStats()
      ]);

      // อัปเดตสถิติ
      setStats({
        totalEmployees: employeesResponse.data?.length || 0,
        presentToday: statsResponse.data?.presentToday || 0,
        absentToday: statsResponse.data?.absentToday || 0,
        lateToday: statsResponse.data?.lateToday || 0,
      });

      // อัปเดตข้อมูลการเข้าออกงานล่าสุด
      setRecentAttendance(attendanceResponse.data?.attendance || []);

      // สร้างข้อมูลกราห (7 วันที่ผ่านมา)
      const chartData = generateChartData();
      setAttendanceChart(chartData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);

  // ตรวจสอบสิทธิ์แอดมิน
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const generateChartData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        name: date.toLocaleDateString('th-TH', { weekday: 'short' }),
        เข้างาน: Math.floor(Math.random() * 20) + 5,
        สาย: Math.floor(Math.random() * 5),
        ขาด: Math.floor(Math.random() * 3),
      });
    }
    return days;
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-2xl font-bold text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <div className={`inline-flex items-center text-sm ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{change.type === 'increase' ? '↗' : '↘'}</span>
            <span className="ml-1">{change.value}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="mt-1 text-sm text-gray-600">
            ภาพรวมการเข้าออกงานของพนักงาน
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="พนักงานทั้งหมด"
            value={stats.totalEmployees}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            title="เข้างานวันนี้"
            value={stats.presentToday}
            icon="✅"
            color="bg-green-500"
          />
          <StatCard
            title="ยังไม่เข้างาน"
            value={stats.absentToday}
            icon="❌"
            color="bg-red-500"
          />
          <StatCard
            title="เข้างานสาย"
            value={stats.lateToday}
            icon="⏰"
            color="bg-yellow-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <Chart
            type="bar"
            data={attendanceChart}
            options={{
              title: 'สถิติการเข้าออกงาน 7 วันที่ผ่านมา',
              height: 300,
              xAxisKey: 'name',
              yAxisKey: 'เข้างาน',
            }}
          />

          {/* Pie Chart */}
          <Chart
            type="pie"
            data={[
              { name: 'เข้างานตรงเวลา', value: stats.presentToday - stats.lateToday },
              { name: 'เข้างานสาย', value: stats.lateToday },
              { name: 'ขาดงาน', value: stats.absentToday },
            ]}
            options={{
              title: 'สถิติการเข้างานวันนี้',
              height: 300,
              yAxisKey: 'value',
            }}
          />
        </div>

        {/* Recent Attendance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">การเข้าออกงานล่าสุด</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    พนักงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {record.employee?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.employee?.name || 'ไม่ระบุ'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.employee?.department || 'ไม่ระบุแผนก'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.type === 'check-in' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.type === 'check-in' ? 'เข้างาน' : 'ออกงาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'on-time' 
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status === 'on-time' ? 'ตรงเวลา' : 
                           record.status === 'late' ? 'สาย' : 'ปกติ'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      ไม่มีข้อมูลการเข้าออกงาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/employees'}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="mr-2">👥</span>
              จัดการพนักงาน
            </button>
            <button
              onClick={() => window.location.href = '/attendance'}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span className="mr-2">📋</span>
              ดูบันทึกเวลา
            </button>
            <button
              onClick={() => window.location.href = '/report'}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <span className="mr-2">📈</span>
              สร้างรายงาน
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
