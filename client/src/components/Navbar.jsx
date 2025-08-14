import React from 'react';
import { useAuth } from '../src/contexts/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1>Face Attendance System</h1>
      <div>
        {user ? (
          <>
            <span>👤 {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <span>กรุณาล็อกอิน</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
