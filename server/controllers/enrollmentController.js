import { Enrollment, Course, User, Notification } from '../models/index.js';

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
export const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existing = await Enrollment.findOne({
            where: { userId: req.user.id, courseId }
        });
        if (existing) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            userId: req.user.id,
            courseId,
        });

        // Create notification
        await Notification.create({
            userId: req.user.id,
            type: 'enrollment',
            message: `You enrolled in "${course.title}"`,
            link: `/course/${courseId}`,
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unenroll from a course
// @route   DELETE /api/enrollments/:courseId
// @access  Private
export const unenrollFromCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const deleted = await Enrollment.destroy({
            where: { userId: req.user.id, courseId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        res.json({ message: 'Unenrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments
// @access  Private
export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Course,
                as: 'course',
                include: [{ model: User, as: 'instructor', attributes: ['name', 'avatar'] }]
            }],
            order: [['updatedAt', 'DESC']],
        });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private
export const updateProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { progress } = req.body;

        const enrollment = await Enrollment.findOne({
            where: { userId: req.user.id, courseId }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        enrollment.progress = Math.min(100, Math.max(0, progress));
        if (enrollment.progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = new Date();
        }
        await enrollment.save();

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check enrollment status for a course
// @route   GET /api/enrollments/:courseId/status
// @access  Private
export const getEnrollmentStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollment = await Enrollment.findOne({
            where: { userId: req.user.id, courseId }
        });
        res.json({ enrolled: !!enrollment, enrollment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
