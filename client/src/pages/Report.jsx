import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import { exportToExcel, formatAttendanceForExport } from '../utils/exportToExcel';

const Report = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    reportType: 'daily', // daily, weekly, monthly
  });

  // ตรวจสอบสิทธิ์แอดมิน
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        employeeId: filters.employeeId,
      };

      const response = await attendanceService.getAllAttendance(params);
      const attendanceData = response.data?.attendance || [];
      
      setReportData(attendanceData);
      generateChartData(attendanceData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('เกิดข้อผิดพลาดในการสร้างรายงาน');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    const groupedData = {};
    
    data.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('th-TH');
      if (!groupedData[date]) {
        groupedData[date] = {
          name: date,
          เข้างานตรงเวลา: 0,
          เข้างานสาย: 0,
          ขาดงาน: 0,
        };
      }
      
      if (record.status === 'on-time') {
        groupedData[date].เข้างานตรงเวลา++;
      } else if (record.status === 'late') {
        groupedData[date].เข้างานสาย++;
      } else if (record.status === 'absent') {
        groupedData[date].ขาดงาน++;
      }
    });

    setChartData(Object.values(groupedData));
  };

  const exportReport = async () => {
    try {
      if (reportData.length === 0) {
        alert('กรุณาสร้างรายงานก่อนส่งออก');
        return;
      }

      const exportData = formatAttendanceForExport(reportData);
      exportToExcel(exportData, 'attendance-report');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกรายงาน');
    }
  };

  const exportServerReport = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        employeeId: filters.employeeId,
      };

      await attendanceService.exportToExcel(params);
    } catch (error) {
      console.error('Error exporting server report:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกรายงาน');
    } finally {
      setLoading(false);
    }
  };

  const getReportSummary = () => {
    if (reportData.length === 0) return null;

    const summary = {
      total: reportData.length,
      onTime: reportData.filter(r => r.status === 'on-time').length,
      late: reportData.filter(r => r.status === 'late').length,
      absent: reportData.filter(r => r.status === 'absent').length,
      avgWorkingHours: reportData.reduce((sum, r) => sum + (r.workingHours || 0), 0) / reportData.length,
    };

    return summary;
  };

  const summary = getReportSummary();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายงานการเข้าออกงาน</h1>
          <p className="mt-1 text-sm text-gray-600">
            สร้างและส่งออกรายงานการเข้าออกงานของพนักงาน
          </p>
        </div>

        {/* Report Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตั้งค่ารายงาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                พนักงาน
              </label>
              <select
                value={filters.employeeId}
                onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทั้งหมด</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทรายงาน
              </label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({...filters, reportType: e.target.value})}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">รายวัน</option>
                <option value="weekly">รายสัปดาห์</option>
                <option value="monthly">รายเดือน</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <span className="mr-2">📊</span>
                  สร้างรายงาน
                </>
              )}
            </button>
            
            <button
              onClick={exportReport}
              disabled={reportData.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <span className="mr-2">📥</span>
              ส่งออก Excel (Client)
            </button>

            <button
              onClick={exportServerReport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <span className="mr-2">📥</span>
              ส่งออก Excel (Server)
            </button>
          </div>
        </div>

        {/* Report Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">รายการทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">✅</span>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">เข้างานตรงเวลา</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.onTime}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">⏰</span>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">เข้างานสาย</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.late}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">❌</span>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">ขาดงาน</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.absent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">⏱️</span>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">เฉลี่ยชั่วโมงทำงาน</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.avgWorkingHours.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart
              type="bar"
              data={chartData}
              options={{
                title: 'สถิติการเข้าออกงานรายวัน',
                height: 300,
                xAxisKey: 'name',
                yAxisKey: 'เข้างานตรงเวลา',
              }}
            />
            <Chart
              type="line"
              data={chartData}
              options={{
                title: 'แนวโน้มการเข้างานสาย',
                height: 300,
                xAxisKey: 'name',
                yAxisKey: 'เข้างานสาย',
              }}
            />
          </div>
        )}

        {/* Report Table Preview */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">ตัวอย่างรายงาน</h3>
              <p className="text-sm text-gray-600">แสดง 10 รายการแรก</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      พนักงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เวลาเข้างาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เวลาออกงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชั่วโมงทำงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.slice(0, 10).map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.employee?.name || 'ไม่ระบุ'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.workingHours ? `${record.workingHours} ชม.` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'on-time' 
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'on-time' ? 'ตรงเวลา' :
                           record.status === 'late' ? 'สาย' : 'ขาด'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportData.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600">
                และอีก {reportData.length - 10} รายการ (ดูทั้งหมดในไฟล์ Excel)
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Report;
