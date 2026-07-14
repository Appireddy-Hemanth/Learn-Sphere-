import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database.js';
import './models/index.js';
import { User, Course, Video } from './models/index.js';
import bcrypt from 'bcrypt';

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        await sequelize.sync({ alter: true });

        // Create instructor user if not exists
        let instructor = await User.findOne({ where: { email: 'instructor@learnsphere.ai' } });
        if (!instructor) {
            const hashedPassword = await bcrypt.hash('Instructor@123', 10);
            instructor = await User.create({
                name: 'Prof. Sarah Chen',
                email: 'instructor@learnsphere.ai',
                password: hashedPassword,
                role: 'Instructor',
            });
            console.log('Instructor user created');
        }

        // Create admin user if not exists
        let adminUser = await User.findOne({ where: { email: 'admin@learnsphere.ai' } });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('AdminPassword@123', 10);
            adminUser = await User.create({
                name: 'System Admin',
                email: 'admin@learnsphere.ai',
                password: hashedPassword,
                role: 'Admin',
            });
            console.log('Admin user created');
        }

        // Delete old videos and courses to re-seed with correct URLs
        await Video.destroy({ where: {} });
        await Course.destroy({ where: {} });
        console.log('Cleared old data');

        const coursesData = [
            {
                title: 'Complete React Development',
                description: 'Master React from basics to advanced patterns including hooks, context, Redux, and building real-world applications.',
                category: 'Web Development',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                difficulty: 'Intermediate',
                rating: 4.8,
                price: 0,
                videos: [
                    { title: 'React in 100 Seconds', description: 'A quick overview of what React is and why developers love it.', url: 'https://www.youtube.com/embed/Tn6-PIqc4UM', duration: 120, order: 1 },
                    { title: 'React Hooks Explained', description: 'Understanding useState, useEffect, and custom hooks.', url: 'https://www.youtube.com/embed/TNhaISOUy6Q', duration: 720, order: 2 },
                    { title: 'Build a React Project', description: 'Step-by-step tutorial building a full React app.', url: 'https://www.youtube.com/embed/b9eMGE7QtTk', duration: 900, order: 3 },
                ]
            },
            {
                title: 'Node.js Backend Mastery',
                description: 'Build scalable backend services with Node.js, Express, authentication, databases, and deployment.',
                category: 'Backend Development',
                thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2fbf12584f?w=800&q=80',
                difficulty: 'Intermediate',
                rating: 4.6,
                price: 0,
                videos: [
                    { title: 'Node.js in 100 Seconds', description: 'Quick intro to Node.js runtime and its capabilities.', url: 'https://www.youtube.com/embed/ENrzD9HAZK4', duration: 120, order: 1 },
                    { title: 'RESTful APIs with Express', description: 'Building RESTful APIs from scratch with Express.js.', url: 'https://www.youtube.com/embed/pKd0Rpw7O48', duration: 840, order: 2 },
                    { title: 'JWT Authentication Tutorial', description: 'Implementing JWT auth in a Node.js application.', url: 'https://www.youtube.com/embed/mbsmsi7l3r4', duration: 660, order: 3 },
                ]
            },
            {
                title: 'Machine Learning Fundamentals',
                description: 'Introduction to machine learning concepts, algorithms, and practical implementation with Python.',
                category: 'Data Science',
                thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
                difficulty: 'Beginner',
                rating: 4.9,
                price: 0,
                videos: [
                    { title: 'Machine Learning Explained', description: 'What is machine learning and how does it work?', url: 'https://www.youtube.com/embed/HgBpFaATdoA', duration: 540, order: 1 },
                    { title: 'Neural Networks Visualized', description: 'A visual introduction to how neural networks learn.', url: 'https://www.youtube.com/embed/aircAruvnKk', duration: 1200, order: 2 },
                    { title: 'Gradient Descent Explained', description: 'Understanding the optimization algorithm behind ML.', url: 'https://www.youtube.com/embed/IHZwWFHWa-w', duration: 720, order: 3 },
                ]
            },
            {
                title: 'UI/UX Design Masterclass',
                description: 'Learn design thinking, prototyping, wireframing, and creating stunning user interfaces.',
                category: 'Design',
                thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
                difficulty: 'Beginner',
                rating: 4.7,
                price: 0,
                videos: [
                    { title: 'UI Design Fundamentals', description: 'Core principles every UI designer should know.', url: 'https://www.youtube.com/embed/tRpoI6vkqLs', duration: 480, order: 1 },
                    { title: 'Color Theory for Designers', description: 'How to choose and combine colors effectively.', url: 'https://www.youtube.com/embed/YeI6Wqn4I78', duration: 600, order: 2 },
                    { title: 'Figma Tutorial for Beginners', description: 'Getting started with Figma for UI design.', url: 'https://www.youtube.com/embed/FTFaQWZBqQ8', duration: 540, order: 3 },
                ]
            },
            {
                title: 'Python for Everyone',
                description: 'Complete Python programming course from zero to hero, covering all essential concepts.',
                category: 'Programming',
                thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
                difficulty: 'Beginner',
                rating: 4.5,
                price: 0,
                videos: [
                    { title: 'Python in 100 Seconds', description: 'A quick tour of Python programming language.', url: 'https://www.youtube.com/embed/x7X9w_GIm1s', duration: 120, order: 1 },
                    { title: 'Python for Beginners - Full Course', description: 'Complete beginner-friendly Python tutorial.', url: 'https://www.youtube.com/embed/kqtD5dpn9C8', duration: 720, order: 2 },
                    { title: 'Python OOP Tutorial', description: 'Object-oriented programming in Python explained.', url: 'https://www.youtube.com/embed/JeznW_7DlB0', duration: 840, order: 3 },
                ]
            },
            {
                title: 'Advanced CSS & Animations',
                description: 'Master CSS Grid, Flexbox, custom properties, and stunning CSS animations and transitions.',
                category: 'Web Development',
                thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80',
                difficulty: 'Advanced',
                rating: 4.4,
                price: 0,
                videos: [
                    { title: 'CSS in 100 Seconds', description: 'Quick overview of CSS and what makes it powerful.', url: 'https://www.youtube.com/embed/OEV8gMkCHXQ', duration: 120, order: 1 },
                    { title: 'CSS Flexbox in 100 Seconds', description: 'Master flexbox layout in under 2 minutes.', url: 'https://www.youtube.com/embed/K74l26pE4YA', duration: 120, order: 2 },
                    { title: 'CSS Grid Tutorial', description: 'Complete guide to building layouts with CSS Grid.', url: 'https://www.youtube.com/embed/uuOXPWCh-6o', duration: 600, order: 3 },
                ]
            },
        ];

        for (const courseData of coursesData) {
            const { videos, ...courseFields } = courseData;
            const course = await Course.create({ ...courseFields, instructorId: instructor.id });

            for (const videoData of videos) {
                await Video.create({ ...videoData, courseId: course.id });
            }
            console.log(`✓ Seeded course: ${course.title}`);
        }

        console.log('\n✅ All courses and videos seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seed();
