import api from './api';

export const getAllAttendances = () => api.get('/attendance');
export const getTodayAttendances = () => api.get('/attendance/today');
export const getAttendanceByDateRange = (start, end) =>
  api.get(`/attendance?start=${start}&end=${end}`);
