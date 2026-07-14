import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bookmark = sequelize.define('Bookmark', {
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
    timestamp: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    tag: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#ffffff',
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: 'bookmarks',
});

export default Bookmark;
