import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('Student', 'Instructor', 'Admin'),
        defaultValue: 'Student',
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lastActive: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
    tableName: 'users',
});

export default User;
