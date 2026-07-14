import './models/index.js';
import { Course } from './models/index.js';
import sequelize from './config/database.js';

async function main() {
    try {
        await sequelize.authenticate();
        const courses = await Course.findAll();
        console.log('Courses in DB:', courses.map(c => ({ id: c.id, title: c.title })));
    } catch (e) {
        console.error(e);
    }
}
main();
