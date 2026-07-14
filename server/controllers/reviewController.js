import { Review, Course, User, Notification } from '../models/index.js';
import sequelize from '../config/database.js';

// @desc    Create or update a review
// @route   POST /api/reviews/:courseId
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user already reviewed
        const existing = await Review.findOne({
            where: { userId: req.user.id, courseId }
        });

        let review;
        if (existing) {
            existing.rating = rating;
            existing.comment = comment || existing.comment;
            await existing.save();
            review = existing;
        } else {
            review = await Review.create({
                userId: req.user.id,
                courseId,
                rating,
                comment,
            });

            // Create notification for the course instructor
            await Notification.create({
                userId: course.instructorId,
                type: 'review',
                message: `${req.user.name} left a ${rating}-star review on "${course.title}"`,
                link: `/course/${courseId}`,
            });
        }

        // Recompute average rating for the course
        const result = await Review.findOne({
            where: { courseId },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
            raw: true,
        });
        course.rating = parseFloat(result.avgRating) || 0;
        await course.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
export const getReviewsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const reviews = await Review.findAll({
            where: { courseId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (author only)
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (review.userId !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own reviews' });
        }

        const courseId = review.courseId;
        await review.destroy();

        // Recompute average rating
        const result = await Review.findOne({
            where: { courseId },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
            raw: true,
        });
        const course = await Course.findByPk(courseId);
        if (course) {
            course.rating = parseFloat(result.avgRating) || 0;
            await course.save();
        }

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
