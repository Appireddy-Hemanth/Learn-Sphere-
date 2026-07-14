import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';
import { Course, Video } from './models/index.js';

const inspectDB = async () => {
    try {
        await sequelize.authenticate();
        const courses = await Course.findAll({ include: [{ model: Video, as: 'videos' }] });
        console.log(`COURSES IN SYSTEM (${courses.length}):`);
        courses.forEach(c => {
            console.log(`- Course: ${c.title} (ID: ${c.id})`);
            c.videos.forEach(v => {
                console.log(`  * Video: ${v.title} (URL: ${v.url}, ID: ${v.id})`);
            });
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
inspectDB();
