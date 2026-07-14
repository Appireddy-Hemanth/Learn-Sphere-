import express from 'express';
import { handleTutorChat, generateQuiz, saveQuizScore } from '../controllers/tutorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes protected by protect middleware
router.post('/', protect, handleTutorChat);
router.get('/quiz/:videoId', protect, generateQuiz);
router.post('/quiz/score', protect, saveQuizScore);

export default router;

