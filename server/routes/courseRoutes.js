import express from 'express';
import { getCourses, getCourseById, createCourse, deleteCourse } from '../controllers/courseController.js';
import { protect, instructor, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCourses).post(protect, instructor, createCourse);
router.route('/:id').get(getCourseById).delete(protect, admin, deleteCourse);

export default router;
