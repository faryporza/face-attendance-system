import express from 'express';
import {
    getUsers,
    createUser,
    deleteUser
} from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 📁 สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadPath = './uploads';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// 📸 ตั้งค่าการเก็บรูป
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({ storage });

// ✅ GET /api/users
router.get('/', verifyToken, getUsers);

// ✅ POST /api/users (with file upload)
router.post('/', verifyToken, upload.single('image'), createUser);

// ✅ DELETE /api/users/:id
router.delete('/:id', verifyToken, deleteUser);

export default router;
