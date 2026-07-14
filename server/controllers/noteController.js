import { Note, Video } from '../models/index.js';

export const addNote = async (req, res) => {
    try {
        const { videoId, timestamp, content } = req.body;
        const note = await Note.create({
            userId: req.user.id,
            videoId,
            timestamp,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotes = async (req, res) => {
    try {
        const notes = await Note.findAll({
            where: { userId: req.user.id },
            include: [{ model: Video, as: 'video', attributes: ['title'] }]
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findByPk(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this note' });
        }
        await note.destroy();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
