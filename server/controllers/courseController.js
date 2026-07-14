import { Course, Video, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getCourses = async (req, res) => {
    try {
        const where = {};
        if (req.query.keyword) {
            where.title = { [Op.iLike]: `%${req.query.keyword}%` };
        }

        const courses = await Course.findAll({
            where,
            include: [{ model: User, as: 'instructor', attributes: ['name', 'avatar'] }]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [{ model: User, as: 'instructor', attributes: ['name', 'avatar'] }]
        });
        if (course) {
            const videos = await Video.findAll({
                where: { courseId: req.params.id },
                order: [['order', 'ASC']]
            });
            res.json({ course, videos });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { title, description, category, thumbnail, difficulty, price } = req.body;

        const course = await Course.create({
            title,
            description,
            category,
            thumbnail,
            instructorId: req.user.id,
            difficulty,
            price
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await course.destroy();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
