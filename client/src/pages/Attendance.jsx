import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Table from '../components/Table';
import { useAuth } from '../contexts/AuthContext';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import { formatDate, formatTime } from '../utils/formatDate';

const Attendance = () => {
  const { isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // ตรวจสอบสิทธิ์แอดมิน
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, [pagination.currentPage, filters]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };
      
      const response = await attendanceService.getAllAttendance(params);
      setAttendance(response.data?.attendance || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data?.totalPages || 1,
        totalItems: response.data?.totalItems || 0,
      }));
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeId: '',
    });
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const columns = [
    {
      key: 'date',
      header: 'วันที่',
      render: (value) => formatDate(value),
    },
    {
      key: 'employee',
      header: 'พนักงาน',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{value?.name || 'ไม่ระบุ'}</div>
          <div className="text-sm text-gray-500">{value?.employeeId || ''}</div>
        </div>
      ),
    },
    {
      key: 'checkIn',
      header: 'เวลาเข้างาน',
      render: (value) => value ? formatTime(value) : '-',
    },
    {
      key: 'checkOut',
      header: 'เวลาออกงาน',
      render: (value) => value ? formatTime(value) : '-',
    },
    {
      key: 'workingHours',
      header: 'ชั่วโมงทำงาน',
      render: (value) => value ? `${value} ชม.` : '-',
    },
    {
      key: 'status',
      header: 'สถานะ',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'on-time' 
            ? 'bg-green-100 text-green-800'
            : value === 'late'
            ? 'bg-yellow-100 text-yellow-800'
            : value === 'absent'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'on-time' ? 'ตรงเวลา' :
           value === 'late' ? 'สาย' :
           value === 'absent' ? 'ขาด' : 'ปกติ'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">บันทึกการเข้าออกงาน</h1>
          <p className="mt-1 text-sm text-gray-600">
            ดูและจัดการบันทึกการเข้าออกงานของพนักงาน
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรอง</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
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
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                พนักงาน
              </label>
              <select
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
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
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">รายการทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalItems}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.filter(record => record.status === 'on-time').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.filter(record => record.status === 'late').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.filter(record => record.status === 'absent').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={attendance}
          loading={loading}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: handlePageChange,
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default Attendance;
