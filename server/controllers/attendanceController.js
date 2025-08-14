import db from '../config/db.js';
import { exportAttendanceToExcel } from '../utils/excelExport.js';

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
