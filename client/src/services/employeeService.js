import api from './api';

export const employeeService = {
  // ดึงรายชื่อพนักงานทั้งหมด
  getAllEmployees: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // ดึงข้อมูลพนักงานรายบุคคล
  getEmployeeById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // เพิ่มพนักงานใหม่
  createEmployee: async (employeeData) => {
    const response = await api.post('/users', employeeData);
    return response.data;
  },

  // อัปเดตข้อมูลพนักงาน
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/users/${id}`, employeeData);
    return response.data;
  },

  // ลบพนักงาน
  deleteEmployee: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // อัปโหลดรูปภาพใบหน้า
  uploadFaceImage: async (id, imageFile) => {
    const formData = new FormData();
    // use 'face_image' to match backend
    formData.append('face_image', imageFile);
    
    // let axios set Content-Type (including boundary) automatically
    const response = await api.post(`/users/${id}/face-image`, formData);
    return response.data;
  }
};

export default employeeService;
