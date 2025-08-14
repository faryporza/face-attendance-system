import express from 'express';
import { loginAdmin, getProfile } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginAdmin);

// GET /api/auth/profile
router.get('/profile', getProfile);

export default router;
