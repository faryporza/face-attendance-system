// ฟังก์ชันสำหรับแปลงวันเวลาเป็นรูปแบบที่อ่านง่าย
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// แปลงวันที่เป็นรูปแบบ ISO สำหรับ input date
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// คำนวณช่วงเวลาจากนี้
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'เมื่อสักครู่';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} นาทีที่แล้ว`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ชั่วโมงที่แล้ว`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} วันที่แล้ว`;
  }
};

// ตรวจสอบว่าเป็นวันนี้หรือไม่
export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const targetDate = new Date(date);
  
  return today.toDateString() === targetDate.toDateString();
};

// คำนวณชั่วโมงทำงาน
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffInMilliseconds = end - start;
  const hours = diffInMilliseconds / (1000 * 60 * 60);
  
  return Math.round(hours * 100) / 100; // ปัดเศษ 2 ตำแหน่ง
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatDateForInput,
  getRelativeTime,
  isToday,
  calculateWorkingHours,
};
