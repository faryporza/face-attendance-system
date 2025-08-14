import api from './api';

export const authService = {
  // เข้าสู่ระบบ
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  // ออกจากระบบ
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ตรวจสอบสิทธิ์แอดมิน
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};

export default authService;
