import { Video, Course } from '../models/index.js';
import { askAITutor, generateAITutorQuiz } from '../services/geminiService.js';

export const handleTutorChat = async (req, res) => {
    try {
        const { videoId, currentTime, message } = req.body;

        if (!videoId || !message) {
            return res.status(400).json({ message: 'videoId and message are required' });
        }

        // Fetch video and course details to provide context
        const video = await Video.findByPk(videoId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const courseTitle = video.course?.title || '';
        const videoTitle = video.title || '';
        const videoDescription = video.description || '';

        const reply = await askAITutor({
            courseTitle,
            videoTitle,
            videoDescription,
            currentTime: currentTime || 0,
            userMessage: message
        });

        res.json({ reply });
    } catch (error) {
        console.error('Error in handleTutorChat:', error);
        res.status(500).json({ message: error.message });
    }
};

export const generateQuiz = async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json({ message: 'videoId is required' });
        }

        const video = await Video.findByPk(videoId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const quiz = await generateAITutorQuiz({
            courseTitle: video.course?.title || '',
            videoTitle: video.title || '',
            videoDescription: video.description || ''
        });

        res.json(quiz);
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ message: error.message });
    }
};

export const saveQuizScore = async (req, res) => {
    try {
        const { score, totalQuestions } = req.body;
        if (score === undefined || !totalQuestions) {
            return res.status(400).json({ message: 'score and totalQuestions are required' });
        }

        const xpEarned = score * 50; // Award 50 XP per correct question
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        user.xp = (user.xp || 0) + xpEarned;
        user.streak = (user.streak || 0) + 1;
        user.lastActive = new Date();
        await user.save();

        res.json({
            success: true,
            xpEarned,
            newXp: user.xp,
            newStreak: user.streak
        });
    } catch (error) {
        console.error('Error saving quiz score:', error);
        res.status(500).json({ message: error.message });
    }
};
