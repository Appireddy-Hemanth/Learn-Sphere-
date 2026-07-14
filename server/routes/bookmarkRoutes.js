import express from 'express';
import { addBookmark, getBookmarks, updateBookmark, deleteBookmark } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addBookmark)
    .get(protect, getBookmarks);

router.route('/:id')
    .put(protect, updateBookmark)
    .delete(protect, deleteBookmark);

export default router;
