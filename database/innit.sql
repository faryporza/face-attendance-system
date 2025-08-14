-- สร้างฐานข้อมูล (ถ้ายังไม่มี)
CREATE DATABASE IF NOT EXISTS face_attendance;
USE face_attendance;

-- ตารางผู้ดูแลระบบ (admin)
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- แนะนำให้เข้ารหัสด้วย bcrypt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางพนักงาน
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_code VARCHAR(50) UNIQUE, -- เช่น EMP001
    position VARCHAR(100),
    department VARCHAR(100),
    face_encoding TEXT,               -- encoding (base64 หรือ JSON string)
    image_url TEXT,                   -- URL ของรูปพนักงาน (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางบันทึกการเข้า-ออกงาน
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('in', 'out') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- view สำหรับ export รายงานรายวัน/เดือน (optional)
-- คุณสามารถใช้ query แยกต่างหาก แทน view ได้เช่นกัน
