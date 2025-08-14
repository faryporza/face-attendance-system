import express from 'express';
import {
  getAllAttendance,
  recordAttendance,
  exportAttendance
} from '../controllers/attendanceController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ GET /api/attendance
router.get('/', verifyToken, getAllAttendance);

// ✅ POST /api/attendance
router.post('/', verifyToken, recordAttendance);

// ✅ GET /api/attendance/export
router.get('/export', verifyToken, exportAttendance);

export default router;
