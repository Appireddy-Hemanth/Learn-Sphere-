import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WatchHistory = sequelize.define('WatchHistory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    videoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    courseId: {
        type: DataTypes.UUID,
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: 'watch_history',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'videoId'],
        },
    ],
});

export default WatchHistory;
