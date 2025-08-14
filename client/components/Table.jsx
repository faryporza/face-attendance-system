import React from 'react';

const Table = ({ data }) => (
  <table>
    <thead>
      <tr>
        <th>ชื่อพนักงาน</th>
        <th>เวลาเข้างาน</th>
        <th>สถานะ</th>
      </tr>
    </thead>
    <tbody>
      {data && data.map((item, idx) => (
        <tr key={idx}>
          <td>{item.name}</td>
          <td>{item.time}</td>
          <td>{item.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
