import api from './api';

const attendanceService = {
  /**
   * Records attendance by sending face image data.
   * @param {FormData} formData The form data containing the face image.
   * @returns {Promise<object>} The response data from the API.
   */
  recordAttendance: async (formData) => {
    try {
      // Do not set Content-Type here — let axios set multipart/form-data with boundary
      const { data } = await api.post('/attendance/record', formData);
      return data;
    } catch (error) {
      console.error('Error in recordAttendance service:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Fetches the attendance history.
   * @returns {Promise<object>} The attendance history data.
   */
  getAttendanceHistory: async () => {
    try {
      const { data } = await api.get('/attendance/history');
      return data;
    } catch (error) {
      console.error('Error in getAttendanceHistory service:', error.response?.data || error.message);
      throw error;
    }
  },

  // ดึงข้อมูลการเข้าออกงาน
  getAttendance: async (params = {}) => {
    const { startDate, endDate, employeeId } = params;
    const queryParams = new URLSearchParams();

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

