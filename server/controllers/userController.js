import db from '../config/db.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

export const getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, employee_code, position, department } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'กรุณาอัปโหลดรูปภาพ' });
        }

        const imagePath = path.resolve(file.path);

        // 👇 เรียกไปยัง Flask API เพื่อดึง face_encoding
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        const response = await axios.post('http://localhost:5001/recognize', formData, {
            headers: formData.getHeaders(),
        });

        const face_encoding = response.data.encoding.join(','); // หรือ JSON.stringify
        const image_url = `http://localhost:3000/uploads/${file.filename}`;

        // 📥 บันทึกลง MySQL
        await db.query(
            'INSERT INTO users (name, employee_code, position, department, face_encoding, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, employee_code, position, department, face_encoding, image_url]
        );

        res.status(201).json({ message: 'เพิ่มพนักงานแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'ไม่สามารถเพิ่มพนักงานได้' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'ลบพนักงานแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'ไม่สามารถลบพนักงานได้' });
    }
};
