import User from './User.js';
import Course from './Course.js';
import Video from './Video.js';
import Bookmark from './Bookmark.js';
import Note from './Note.js';
import WatchHistory from './WatchHistory.js';
import Enrollment from './Enrollment.js';
import Review from './Review.js';
import Notification from './Notification.js';

// Associations
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

Course.hasMany(Video, { foreignKey: 'courseId', as: 'videos' });
Video.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Bookmark, { foreignKey: 'userId' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });
Video.hasMany(Bookmark, { foreignKey: 'videoId' });
Bookmark.belongsTo(Video, { foreignKey: 'videoId', as: 'video' });

User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });
Video.hasMany(Note, { foreignKey: 'videoId' });
Note.belongsTo(Video, { foreignKey: 'videoId', as: 'video' });

User.hasMany(WatchHistory, { foreignKey: 'userId' });
WatchHistory.belongsTo(User, { foreignKey: 'userId' });
Video.hasMany(WatchHistory, { foreignKey: 'videoId' });
WatchHistory.belongsTo(Video, { foreignKey: 'videoId' });
Course.hasMany(WatchHistory, { foreignKey: 'courseId' });
WatchHistory.belongsTo(Course, { foreignKey: 'courseId' });

// Enrollment associations
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Review associations
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Course.hasMany(Review, { foreignKey: 'courseId' });
Review.belongsTo(Course, { foreignKey: 'courseId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export { User, Course, Video, Bookmark, Note, WatchHistory, Enrollment, Review, Notification };
