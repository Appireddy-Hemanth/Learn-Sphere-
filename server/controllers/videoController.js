import { Video, Course } from '../models/index.js';

export const getVideosByCourse = async (req, res) => {
    try {
        const videos = await Video.findAll({
            where: { courseId: req.params.courseId },
            order: [['order', 'ASC']]
        });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addVideo = async (req, res) => {
    try {
        const { title, description, url, courseId, duration, order } = req.body;

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized for this course' });
        }

        const video = await Video.create({
            title,
            description,
            url,
            courseId,
            duration,
            order
        });

        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
