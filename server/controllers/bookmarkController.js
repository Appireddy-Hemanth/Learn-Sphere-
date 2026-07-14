import { Bookmark, Video } from '../models/index.js';

export const addBookmark = async (req, res) => {
    try {
        const { videoId, timestamp, title, description, tag, color } = req.body;

        // Auto-generate a title if empty/optional
        let bookmarkTitle = title;
        if (!bookmarkTitle) {
            const minutes = Math.floor(timestamp / 60);
            const seconds = Math.floor(timestamp % 60).toString().padStart(2, '0');
            bookmarkTitle = `Bookmark @ ${minutes}:${seconds}`;
        }

        const bookmark = await Bookmark.create({
            userId: req.user.id,
            videoId,
            timestamp,
            title: bookmarkTitle,
            description,
            tag,
            color
        });

        res.status(201).json(bookmark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookmarks = async (req, res) => {
    try {
        const whereClause = { userId: req.user.id };
        if (req.query.videoId) {
            whereClause.videoId = req.query.videoId;
        }

        const bookmarks = await Bookmark.findAll({
            where: whereClause,
            include: [{ model: Video, as: 'video', attributes: ['title', 'url'] }],
            order: [['timestamp', 'ASC']]
        });
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBookmark = async (req, res) => {
    try {
        const { title, description } = req.body;
        const bookmark = await Bookmark.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        bookmark.title = title || bookmark.title;
        if (description !== undefined) {
            bookmark.description = description;
        }

        await bookmark.save();
        res.json(bookmark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        await bookmark.destroy();
        res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
