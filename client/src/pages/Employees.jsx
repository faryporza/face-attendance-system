import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const res = await axios.get('http://localhost:3000/api/users');
    setEmployees(res.data.users || []);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">👥 จัดการพนักงาน</h2>
      <table className="w-full table-auto border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#</th>
            <th className="border p-2">ชื่อ</th>
            <th className="border p-2">อีเมล</th>
            <th className="border p-2">รูปภาพ</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, i) => (
            <tr key={emp.id}>
              <td className="border p-2 text-center">{i + 1}</td>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">
                <img src={`http://localhost:3000/uploads/${emp.image}`} alt={emp.name} className="w-16 h-16 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;
