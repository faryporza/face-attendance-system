// utils/formatDate.js
export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ✅ ใช้ใน component:
import { formatDate } from './formatDate';
console.log(formatDate("2025-08-14T08:00:00Z")); // 👉 "14 ส.ค. 2568"
