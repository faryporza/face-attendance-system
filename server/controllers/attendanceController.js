import db from '../config/db.js';
import { exportAttendanceToExcel } from '../utils/excelExport.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

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

// ฟังก์ชันสำหรับบันทึกการเข้าออกงานด้วย Face Recognition
export const recordAttendanceWithFace = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'ไม่พบไฟล์รูปภาพ' 
            });
        }

        const imagePath = req.file.path;
        
        try {
            // ส่งรูปไปยัง Python service สำหรับ face recognition
            const imageBuffer = fs.readFileSync(imagePath);
            
            const response = await axios.post('http://localhost:5000/recognize', imageBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });

            const recognitionResult = response.data;

            if (recognitionResult.success && recognitionResult.employee_id) {
                // ตรวจสอบว่าพนักงานมีอยู่ในระบบหรือไม่
                const [userRows] = await db.query(
                    'SELECT * FROM users WHERE employee_id = ?',
                    [recognitionResult.employee_id]
                );

                if (userRows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'ไม่พบข้อมูลพนักงานในระบบ'
                    });
                }

                const user = userRows[0];

                // ตรวจสอบการเข้าออกงานล่าสุดในวันนี้
                const today = new Date().toISOString().split('T')[0];
                const [attendanceRows] = await db.query(
                    `SELECT * FROM attendance 
                     WHERE user_id = ? AND DATE(timestamp) = ? 
                     ORDER BY timestamp DESC LIMIT 1`,
                    [user.id, today]
                );

                let attendanceType = 'check-in';
                let status = 'on-time';

                // ถ้ามีการบันทึกแล้ววันนี้ ให้เป็น check-out
                if (attendanceRows.length > 0) {
                    const lastRecord = attendanceRows[0];
                    if (lastRecord.type === 'check-in') {
                        attendanceType = 'check-out';
                    }
                }

                // ตรวจสอบเวลาสำหรับสถานะ (เช่น สาย)
                const currentTime = new Date();
                const workStartTime = new Date();
                workStartTime.setHours(9, 0, 0, 0); // 9:00 AM

                if (attendanceType === 'check-in' && currentTime > workStartTime) {
                    status = 'late';
                }

                // บันทึกลงฐานข้อมูล
                await db.query(
                    'INSERT INTO attendance (user_id, type, status, timestamp) VALUES (?, ?, ?, NOW())',
                    [user.id, attendanceType, status]
                );

                // ลบไฟล์รูปภาพชั่วคราว
                fs.unlinkSync(imagePath);

                res.json({
                    success: true,
                    message: `บันทึก${attendanceType === 'check-in' ? 'เข้างาน' : 'ออกงาน'}เรียบร้อย`,
                    employee: {
                        id: user.id,
                        name: user.name,
                        employee_id: user.employee_id
                    },
                    type: attendanceType,
                    status: status,
                    timestamp: new Date().toISOString()
                });

            } else {
                // ลบไฟล์รูปภาพชั่วคราว
                fs.unlinkSync(imagePath);
                
                res.status(404).json({
                    success: false,
                    message: 'ไม่สามารถระบุตัวตนได้ กรุณาลองใหม่อีกครั้ง'
                });
            }

        } catch (faceRecognitionError) {
            console.error('Face recognition error:', faceRecognitionError);
            
            // ลบไฟล์รูปภาพชั่วคราว
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            res.status(500).json({
                success: false,
                message: 'ไม่สามารถเชื่อมต่อกับระบบจดจำใบหน้าได้'
            });
        }

    } catch (err) {
        console.error('Record attendance error:', err);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        });
    }
};

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


export const getAttendanceByUser = async (req, res) => {
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
