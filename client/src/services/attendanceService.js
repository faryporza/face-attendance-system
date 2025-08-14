import api from './api';

export const attendanceService = {
  // บันทึกเวลาเข้า-ออกงานด้วยการสแกนใบหน้า
  recordAttendance: async (imageBlob) => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'attendance.jpg');
    
    const response = await api.post('/attendance/record', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ดึงบันทึกการเข้าออกงานทั้งหมด
  getAllAttendance: async (params = {}) => {
    const { page = 1, limit = 10, startDate, endDate, employeeId } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (employeeId) queryParams.append('employeeId', employeeId);

    const response = await api.get(`/attendance?${queryParams}`);
    return response.data;
  },

  // ดึงบันทึกการเข้าออกงานของพนักงานเฉพาะคน
  getEmployeeAttendance: async (employeeId, params = {}) => {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await api.get(`/attendance/employee/${employeeId}?${queryParams}`);
    return response.data;
  },

  // สร้างรายงาน Excel
  exportToExcel: async (params = {}) => {
    const { startDate, endDate, employeeId } = params;
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (employeeId) queryParams.append('employeeId', employeeId);

    const response = await api.get(`/attendance/export?${queryParams}`, {
      responseType: 'blob',
    });

    // สร้างลิงก์ดาวน์โหลด
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  // ดึงสถิติการเข้าออกงาน
  getAttendanceStats: async (params = {}) => {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await api.get(`/attendance/stats?${queryParams}`);
    return response.data;
  }
};

export default attendanceService;
