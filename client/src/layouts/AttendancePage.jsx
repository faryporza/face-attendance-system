// src/pages/AttendancePage.jsx
import React from 'react';
import AdminLayout from './AdminLayout';
import Attendance from '../pages/Attendance'; // หรือจาก ../components/Attendance ถ้าคุณแยกไว้ตรงนั้น

const AttendancePage = () => {
  return (
    <AdminLayout>
      <Attendance />
    </AdminLayout>
  );
};

export default AttendancePage;
