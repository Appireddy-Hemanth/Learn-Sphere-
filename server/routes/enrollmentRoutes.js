import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    enrollInCourse,
    unenrollFromCourse,
    getMyEnrollments,
    updateProgress,
    getEnrollmentStatus
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMyEnrollments);

router.route('/:courseId')
    .post(enrollInCourse)
    .delete(unenrollFromCourse);

router.route('/:courseId/progress')
    .put(updateProgress);

router.route('/:courseId/status')
    .get(getEnrollmentStatus);

export default router;
