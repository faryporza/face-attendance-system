import express from 'express';
import {
    getAllAttendance,
    recordAttendance,
    recordAttendanceWithFace,
    exportAttendance,
    getAttendanceByDateRange,
    getAttendanceHistory
} from '../controllers/attendanceController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ GET /api/attendance
router.get('/', verifyToken, getAllAttendance);

// ✅ POST /api/attendance
router.post('/', verifyToken, recordAttendance);

// ✅ POST /api/attendance/record (สำหรับ face recognition)
// Use controller's handler which invokes multer internally — do NOT mount upload.single here.
router.post('/record', recordAttendanceWithFace);

// ✅ GET /api/attendance/export
router.get('/export', verifyToken, exportAttendance);

// ✅ GET /api/attendance/by-date
router.get('/by-date', verifyToken, getAttendanceByDateRange);

// GET /api/attendance/history - ดูประวัติการเข้างาน
router.get('/history', getAttendanceHistory);

export default router;
router.get('/history', getAttendanceHistory);

