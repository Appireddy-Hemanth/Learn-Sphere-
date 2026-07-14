import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getLeaderboard,
    getProfile,
    updateProfile,
    getAdminStats,
    getAdminUsers,
    deleteUser
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Profile routes
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.get('/leaderboard', protect, getLeaderboard);

// Admin routes
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/users', protect, admin, getAdminUsers);
router.delete('/admin/users/:id', protect, admin, deleteUser);

export default router;
