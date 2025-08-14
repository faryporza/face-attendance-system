import express from 'express';
import {
    getAllAttendance,
    recordAttendance,
    recordAttendanceWithFace,
    upload,
    exportAttendance,
    getAttendanceByDateRange,
    getAttendanceByUser
} from '../controllers/attendanceController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ GET /api/attendance
router.get('/', verifyToken, getAllAttendance);

// ✅ POST /api/attendance
router.post('/', verifyToken, recordAttendance);

// ✅ POST /api/attendance/record (สำหรับ face recognition)
router.post('/record', upload.single('image'), recordAttendanceWithFace);

// ✅ GET /api/attendance/export
router.get('/export', verifyToken, exportAttendance);

// ✅ GET /api/attendance/by-date
router.get('/by-date', verifyToken, getAttendanceByDateRange);

// ✅ GET /api/attendance/user/:user_id
router.get('/user/:user_id', verifyToken, getAttendanceByUser);

export default router;
