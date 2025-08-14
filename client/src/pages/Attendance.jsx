import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [records, setRecords] = useState([]);

  const fetchAttendance = async () => {
    const res = await axios.get('http://localhost:3000/api/attendance');
    setRecords(res.data.attendance || []);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📅 บันทึกการเข้า/ออก</h2>
      <table className="w-full table-auto border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#</th>
            <th className="border p-2">ชื่อพนักงาน</th>
            <th className="border p-2">เวลา</th>
            <th className="border p-2">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r.id}>
              <td className="border p-2 text-center">{i + 1}</td>
              <td className="border p-2">{r.name}</td>
              <td className="border p-2">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="border p-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
