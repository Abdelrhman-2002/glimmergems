import express from 'express';
import { 
  adminLogin, 
  getDashboardStats, 
  getUsers, 
  getUserById,
  createAdminUser
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, admin, getUserById);
router.post('/users', protect, admin, createAdminUser);

export default router; 