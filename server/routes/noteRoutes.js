import express from 'express';
import { addNote, getNotes, deleteNote } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').post(protect, addNote).get(protect, getNotes);
router.route('/:id').delete(protect, deleteNote);

export default router;
