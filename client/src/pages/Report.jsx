import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Report = () => {
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const fetchReport = async () => {
    const res = await axios.get('http://localhost:3000/api/report', {
      params: {
        from: dateRange.from,
        to: dateRange.to,
      },
    });
    setData(res.data.records || []);
  };

  const exportExcel = async () => {
    const res = await axios.get('http://localhost:3000/api/report/export', {
      params: {
        from: dateRange.from,
        to: dateRange.to,
      },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance_report.xlsx');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📑 รายงานเข้า/ออก</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="border px-2 py-1"
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="border px-2 py-1"
        />
        <button
          onClick={fetchReport}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          🔍 ดูรายงาน
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          ⬇️ ส่งออก Excel
        </button>
      </div>

      <table className="w-full table-auto border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#</th>
            <th className="border p-2">ชื่อ</th>
            <th className="border p-2">เวลา</th>
            <th className="border p-2">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{row.name}</td>
              <td className="border p-2">{new Date(row.timestamp).toLocaleString()}</td>
              <td className="border p-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;
