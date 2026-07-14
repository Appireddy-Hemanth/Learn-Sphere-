import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createReview,
    getReviewsByCourse,
    deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.route('/:courseId')
    .get(getReviewsByCourse)
    .post(protect, createReview);

router.route('/:reviewId')
    .delete(protect, deleteReview);

export default router;
