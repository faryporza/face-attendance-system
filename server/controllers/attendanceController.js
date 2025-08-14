import db from '../config/db.js';
import { exportAttendanceToExcel } from '../utils/excelExport.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data'; // added

// Multer configuration สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });

export const getAllAttendance = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT attendance.*, users.name FROM attendance
             JOIN users ON attendance.user_id = users.id
             ORDER BY attendance.timestamp DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดกับฐานข้อมูล' });
    }
};

export const recordAttendance = async (req, res) => {
    const { user_id, status } = req.body;
    try {
        await db.query(
            'INSERT INTO attendance (user_id, status) VALUES (?, ?)',
            [user_id, status]
        );
        res.status(201).json({ message: 'บันทึกข้อมูลเข้า/ออกงานแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'ไม่สามารถบันทึกข้อมูลได้' });
    }
};

// Configure multer to store files in memory
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Exported controller expected by routes: recordAttendanceWithFace
export const recordAttendanceWithFace = [
  // 1) Multer middleware invoked at runtime to capture multer errors and ensure field name matches
  (req, res, next) => {
    memoryUpload.single('face_image')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        const isMulter = err && (err.name === 'MulterError' || err.code);
        return res.status(isMulter ? 400 : 500).json({
          success: false,
          message: isMulter ? 'File upload error' : 'Internal server error',
          error: err.message,
        });
      }
      next();
    });
  },

  // 2) Main handler (saves attendance to DB when a user match is found)
  async (req, res) => {
    try {
      console.log('📸 /api/attendance/record called', {
        contentType: req.headers['content-type'],
        hasFile: !!req.file,
      });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No face image provided (expected field: face_image)',
        });
      }

      // Convert uploaded buffer to base64
      const base64Image = req.file.buffer.toString('base64');

      // prepare python URL and optional API keys/tokens
      const pythonBase = (process.env.PYTHON_SERVICE_URL || 'http://localhost:5000').replace(/\/$/, '');
      const pythonUrl = `${pythonBase}/recognize`;
      const apiKey = process.env.PYTHON_API_KEY;
      const bearer = process.env.PYTHON_API_BEARER;

      console.log('➡️ Calling Python service', { pythonUrl, usingApiKey: !!apiKey, usingBearer: !!bearer });

      // helper to log axios error details
      const logAxiosError = (label, err) => {
        const status = err.response?.status;
        const data = err.response?.data;
        console.warn(label, { status, data, message: err.message });
      };

      // helper to save attendance when person_name is known
      const saveAttendanceForPerson = async (person_name, confidence) => {
        // try to find the user by name
        const [users] = await db.query('SELECT id FROM users WHERE name = ? LIMIT 1', [person_name]);
        if (users && users.length > 0) {
          const userId = users[0].id;
          const [insertResult] = await db.query(
            'INSERT INTO attendance (user_id, status, confidence) VALUES (?, ?, ?)',
            [userId, 'in', confidence]
          );
          const insertedId = insertResult.insertId;
          const attendanceRecord = {
            id: insertedId,
            user_id: userId,
            person_name,
            confidence,
            timestamp: new Date().toISOString(),
            status: 'success',
          };
          return { saved: true, attendanceRecord };
        }

        // user not found
        return { saved: false };
      };

      // Helper to attempt multipart with a given field name and header set
      const tryMultipart = async (fieldName, headers = {}) => {
        const form = new FormData();
        form.append(fieldName, Buffer.from(base64Image, 'base64'), {
          filename: 'capture.jpg',
          contentType: req.file.mimetype || 'image/jpeg',
        });
        const formHeaders = { ...form.getHeaders(), ...headers };
        return axios.post(pythonUrl, form, { headers: formHeaders, timeout: 10000 });
      };

      try {
        // Prefer multipart 'image' up-front because Python expects an image part
        const headers = {};
        if (apiKey) headers['x-api-key'] = apiKey;
        if (bearer) headers['Authorization'] = `Bearer ${bearer}`;

        // Attempt 1: multipart 'image'
        try {
          const resMultipart = await tryMultipart('image', headers);
          const { recognized, person_name, confidence } = resMultipart.data || {};
          if (recognized && confidence > 0.7) {
            const result = await saveAttendanceForPerson(person_name, confidence);
            if (result.saved) {
              return res.json({
                success: true,
                message: `Attendance recorded for ${person_name}`,
                data: result.attendanceRecord,
              });
            }
            return res.json({
              success: true,
              message: `Face recognized (${person_name}) but no matching user found. Attendance not saved.`,
              data: { person_name, confidence },
            });
          }

          // changed: return structured failure (HTTP 200) instead of 400 so frontend receives data
          return res.json({
            success: false,
            message: 'Face not recognized or confidence too low',
            confidence,
          });
        } catch (errImage) {
          logAxiosError('⚠️ Python multipart(image) failed', errImage);

          // Retry with field 'file' which some endpoints accept
          try {
            const resFile = await tryMultipart('file', headers);
            const { recognized, person_name, confidence } = resFile.data || {};
            if (recognized && confidence > 0.7) {
              const result = await saveAttendanceForPerson(person_name, confidence);
              if (result.saved) {
                return res.json({
                  success: true,
                  message: `Attendance recorded for ${person_name}`,
                  data: result.attendanceRecord,
                });
              }
              return res.json({
                success: true,
                message: `Face recognized (${person_name}) but no matching user found. Attendance not saved.`,
                data: { person_name, confidence },
              });
            }

            // changed: structured failure (HTTP 200)
            return res.json({
              success: false,
              message: 'Face not recognized or confidence too low',
              confidence,
            });
          } catch (errFile) {
            logAxiosError('⚠️ Python multipart(file) failed', errFile);
            // Fall through to JSON fallback
          }
        }

        // Final fallback: try sending base64 JSON (last resort)
        try {
          const jsonHeaders = {};
          if (apiKey) jsonHeaders['x-api-key'] = apiKey;
          if (bearer) jsonHeaders['Authorization'] = `Bearer ${bearer}`;

          const resJson = await axios.post(pythonUrl, { image: base64Image }, { headers: jsonHeaders, timeout: 10000 });
          const { recognized, person_name, confidence } = resJson.data || {};
          if (recognized && confidence > 0.7) {
            const result = await saveAttendanceForPerson(person_name, confidence);
            if (result.saved) {
              return res.json({
                success: true,
                message: `Attendance recorded for ${person_name}`,
                data: result.attendanceRecord,
              });
            }
            return res.json({
              success: true,
              message: `Face recognized (${person_name}) but no matching user found. Attendance not saved.`,
              data: { person_name, confidence },
            });
          }

          // changed: structured failure (HTTP 200)
          return res.json({
            success: false,
            message: 'Face not recognized or confidence too low',
            confidence,
          });
        } catch (errJson) {
          logAxiosError('⚠️ Python JSON request failed', errJson);
        }

        // If all attempts failed, return clear 502 with hint
        console.error('❌ All attempts to contact Python service failed.');
        return res.status(502).json({
          success: false,
          message: 'Python recognition service unavailable or rejected request (see server logs for details).',
          debug: { pythonUrl, usedApiKey: !!apiKey, usedBearer: !!bearer }
        });
      } catch (outerErr) {
        console.error('❌ Unexpected error while calling Python service:', outerErr);
        return res.status(500).json({ success: false, message: 'Internal server error', error: outerErr.message });
      }
    } catch (error) {
      console.error('❌ Error recording attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },
];


export const exportAttendance = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, u.name FROM attendance a
             JOIN users u ON a.user_id = u.id
             ORDER BY a.timestamp DESC`
        );
        await exportAttendanceToExcel(rows, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'ไม่สามารถ export รายงานได้' });
    }
};

export const getAttendanceByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT a.*, u.name FROM attendance a
             JOIN users u ON a.user_id = u.id
             WHERE DATE(a.timestamp) BETWEEN ? AND ?
             ORDER BY a.timestamp DESC`,
            [startDate, endDate]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลตามช่วงเวลาได้' });
    }
};


export const getUserAttendanceRecords = async (req, res) => {
    const { user_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT * FROM attendance
             WHERE user_id = ?
             ORDER BY timestamp DESC`,
            [user_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลพนักงานได้' });
    }
};

// ดูประวัติการเข้างาน
export const getAttendanceHistory = async (req, res) => {
  try {
    console.log('📋 Getting attendance history...');
    
    // Mock history data
    const mockHistory = [
      {
        id: 1,
        person_name: 'John Doe',
        timestamp: new Date().toISOString(),
        status: 'success',
        confidence: 0.95
      },
      {
        id: 2,
        person_name: 'Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success',
        confidence: 0.88
      }
    ];

    console.log('✅ Attendance history retrieved');

      res.json({
        success: true,
        data: mockHistory
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'ไม่สามารถดึงประวัติการเข้างานได้' });
    }
  }

