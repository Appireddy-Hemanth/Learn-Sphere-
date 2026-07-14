import express from 'express';
import { addVideo, getVideosByCourse } from '../controllers/videoController.js';
import { protect, instructor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/course/:courseId').get(getVideosByCourse);
router.route('/').post(protect, instructor, addVideo);

export default router;
