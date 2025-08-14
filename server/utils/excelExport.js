import ExcelJS from 'exceljs';

/**
 * สร้างไฟล์ Excel จากข้อมูล attendance แล้วส่งกลับผ่าน response
 * @param {Array} data - รายการการเข้าออกงาน (user_id, name, status, timestamp)
 * @param {Object} res - Express response object
 */
export const exportAttendanceToExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // หัวตาราง
  worksheet.columns = [
    { header: 'ลำดับ', key: 'index', width: 10 },
    { header: 'ชื่อพนักงาน', key: 'name', width: 30 },
    { header: 'สถานะ', key: 'status', width: 10 },
    { header: 'เวลาเข้า/ออก', key: 'timestamp', width: 25 },
  ];

  // เพิ่มข้อมูลลงไป
  data.forEach((item, index) => {
    worksheet.addRow({
      index: index + 1,
      name: item.name,
      status: item.status === 'in' ? 'เข้า' : 'ออก',
      timestamp: new Date(item.timestamp).toLocaleString('th-TH'),
    });
  });

  // กำหนด header response
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

  // ส่งไฟล์ออก
  await workbook.xlsx.write(res);
  res.end();
};
