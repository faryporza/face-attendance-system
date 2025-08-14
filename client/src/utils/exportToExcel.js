import * as XLSX from 'xlsx';

// ส่งออกข้อมูลเป็นไฟล์ Excel
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  // สร้าง workbook และ worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // ปรับขนาดคอลัมน์อัตโนมัติ
  const colWidths = [];
  if (data.length > 0) {
    Object.keys(data[0]).forEach((key, index) => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => (row[key] || '').toString().length)
      );
      colWidths[index] = { wch: Math.min(maxLength + 2, 50) };
    });
  }
  worksheet['!cols'] = colWidths;

  // เพิ่ม worksheet เข้า workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // ส่งออกไฟล์
  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// แปลงข้อมูลการเข้าออกงานสำหรับส่งออก Excel
export const formatAttendanceForExport = (attendanceData) => {
  return attendanceData.map((record, index) => ({
    'ลำดับ': index + 1,
    'รหัสพนักงาน': record.employeeId || '',
    'ชื่อ-นามสกุล': record.employee?.name || '',
    'แผนก': record.employee?.department || '',
    'วันที่': new Date(record.date).toLocaleDateString('th-TH'),
    'เวลาเข้างาน': record.checkIn ? new Date(record.checkIn).toLocaleTimeString('th-TH') : '',
    'เวลาออกงาน': record.checkOut ? new Date(record.checkOut).toLocaleTimeString('th-TH') : '',
    'ชั่วโมงทำงาน': record.workingHours || 0,
    'สถานะ': record.status || '',
    'หมายเหตุ': record.note || ''
  }));
};

// แปลงข้อมูลพนักงานสำหรับส่งออก Excel
export const formatEmployeesForExport = (employeeData) => {
  return employeeData.map((employee, index) => ({
    'ลำดับ': index + 1,
    'รหัสพนักงาน': employee.employeeId || '',
    'ชื่อ-นามสกุล': employee.name || '',
    'อีเมล': employee.email || '',
    'แผนก': employee.department || '',
    'ตำแหน่ง': employee.position || '',
    'เบอร์โทรศัพท์': employee.phone || '',
    'วันที่เริ่มงาน': employee.startDate ? new Date(employee.startDate).toLocaleDateString('th-TH') : '',
    'สถานะ': employee.status || ''
  }));
};

export default {
  exportToExcel,
  formatAttendanceForExport,
  formatEmployeesForExport,
};
