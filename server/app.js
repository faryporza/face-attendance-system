import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); // รองรับ JSON payload

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// ✅ ตรวจเช็ค API ยังทำงาน
app.get('/', (req, res) => {
  res.send('🎉 Face Attendance API is running');
});

export default app;
