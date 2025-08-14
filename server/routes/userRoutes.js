import express from 'express';
import {
  getUsers,
  createUser,
  deleteUser
} from '../controllers/userController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ GET /api/users
router.get('/', verifyToken, getUsers);

// ✅ POST /api/users
router.post('/', verifyToken, createUser);

// ✅ DELETE /api/users/:id
router.delete('/:id', verifyToken, deleteUser);

export default router;
