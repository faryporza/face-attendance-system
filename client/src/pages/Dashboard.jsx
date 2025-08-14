import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📊 Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="text-lg font-semibold">จำนวนพนักงาน</p>
          <p className="text-2xl">45</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <p className="text-lg font-semibold">เข้าแล้ววันนี้</p>
          <p className="text-2xl">32</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
