import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    difficulty: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
        defaultValue: 'Beginner',
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    tableName: 'courses',
});

export default Course;
