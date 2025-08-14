import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <aside className="sidebar">
    <ul>
      <li><Link to="/">🏠 Dashboard</Link></li>
      <li><Link to="/add">➕ เพิ่มพนักงาน</Link></li>
      <li><Link to="/recognize">📷 ตรวจใบหน้า</Link></li>
      <li><Link to="/report">📊 รายงาน</Link></li>
    </ul>
  </aside>
);

export default Sidebar;
