// utils/exportToExcel.js
import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'report.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, fileName);
};

// ✅ ใช้ใน Report.jsx:
import { exportToExcel } from './exportToExcel';

const handleExport = () => {
  const data = [
    { name: 'สมชาย', date: '14 ส.ค. 2568', time: '08:00 น.' },
    { name: 'สมหญิง', date: '14 ส.ค. 2568', time: '08:15 น.' },
  ];
  exportToExcel(data, 'attendance-report.xlsx');
};
