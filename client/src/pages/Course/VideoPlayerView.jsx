import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlay, FaPause, FaExpand, FaBookmark, FaStickyNote,
    FaArrowLeft, FaSpinner, FaList, FaTrash, FaEdit,
    FaCheck, FaTimes, FaExternalLinkAlt, FaClock
} from 'react-icons/fa';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const VideoPlayerView = () => {
    const { user } = useAuthStore();
    const { courseId, videoId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isBlurred, setIsBlurred] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [youtubeStart, setYoutubeStart] = useState(0);

    // Fetch course data (includes videos)
    const { data: courseData, isLoading: courseLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/courses/${courseId}`);
            return data;
        },
    });

    // Fetch videos for the course
    const { data: videos = [], isLoading: videosLoading } = useQuery({
        queryKey: ['videos', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/videos/course/${courseId}`);
            return data;
        },
    });

    const course = courseData?.course;
    const videoList = Array.isArray(videos) ? videos : [];
    const currentVideo = videoList.find(v => v.id === videoId) || videoList[0];

    // Determine if the video URL is a YouTube embed
    const isYouTube = currentVideo?.url?.includes('youtube.com/embed');

    // Reset YouTube start timestamp when changing videos
    useEffect(() => {
        setYoutubeStart(0);
        setCurrentTime(0);
        setProgress(0);
        setIsPlaying(false);
    }, [videoId]);

    // Handle YouTube estimated timestamp counter when playing and focused
    useEffect(() => {
        if (!isYouTube) return;
        const interval = setInterval(() => {
            if (document.hasFocus() && !isBlurred) {
                setCurrentTime(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [videoId, isYouTube, isBlurred]);

    // SCREENSHOT PROTECTION & BLUR (for both native and YouTube video views)
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeydown = (e) => {
            if (
                e.key === 'PrintScreen' ||
                e.key === 'F12' ||
                (e.ctrlKey && ['s', 'u', 'p'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault();
                setIsBlurred(true);
                alert('Action prevented for security purposes.');
            }
        };

        const handleBlur = () => {
            // Check if document has focus after a 100ms delay to ignore focus shift into YouTube iframe
            setTimeout(() => {
                if (!document.hasFocus()) {
                    setIsBlurred(true);
                }
            }, 100);
        };
        const handleFocus = () => setIsBlurred(false);

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isYouTube]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const goToVideo = (vid) => {
        navigate(`/course/${courseId}/video/${vid.id}`);
    };

    // Seek to specific timestamp
    const handleSeek = (timestamp) => {
        if (isYouTube) {
            setYoutubeStart(timestamp);
            setCurrentTime(timestamp);
        } else if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    if (courseLoading || videosLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <FaSpinner className="animate-spin text-4xl text-primary-500" />
            </div>
        );
    }

    if (!course || !currentVideo) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-900 gap-4">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Course details not found</p>
                <Link to="/courses" className="text-primary-600 hover:underline">← Back to Courses</Link>
            </div>
        );
    }

    const embedUrl = (() => {
        if (!currentVideo?.url) return '';
        const separator = currentVideo.url.includes('?') ? '&' : '?';
        if (youtubeStart > 0) {
            return `${currentVideo.url}${separator}start=${youtubeStart}&autoplay=1`;
        }
        return currentVideo.url;
    })();

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-dark-900 transition-colors p-4 lg:p-8 flex flex-col lg:flex-row gap-8">

            {/* Video Section */}
            <div className="lg:w-2/3 flex flex-col gap-4">
                {/* Back button */}
                <Link to={`/course/${courseId}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition w-fit">
                    <FaArrowLeft /> Back to Course
                </Link>

                {/* Video Player Container */}
                <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video select-none group">

                    {/* Blur overlay */}
                    {isBlurred && (
                        <div className="absolute inset-0 z-50 backdrop-blur-3xl bg-black/80 flex items-center justify-center">
                            <p className="text-white text-lg font-bold text-center px-4">
                                Video paused & hidden.<br /><span className="text-sm font-normal">Please click back into the window to resume. (Screenshot Protection)</span>
                            </p>
                        </div>
                    )}

                    {/* Moving Watermark */}
                    {!isYouTube && (
                        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-10">
                            <marquee direction="down" width="100%" height="100%" behavior="alternate">
                                <marquee behavior="alternate" scrollamount="3">
                                    <span className="text-white font-bold text-2xl rotate-45 block select-none">
                                        {user?.email || 'student@learnsphere.ai'}
                                    </span>
                                </marquee>
                            </marquee>
                        </div>
                    )}

                    {isYouTube ? (
                        <iframe
                            src={embedUrl}
                            title={currentVideo?.title}
                            className={`w-full h-full ${isBlurred ? 'blur-xl' : ''}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                src={currentVideo?.url || ''}
                                className={`w-full h-full object-contain ${isBlurred ? 'blur-xl' : ''}`}
                                onTimeUpdate={handleTimeUpdate}
                                controls={false}
                            />

                            {/* Custom Controls UI (only for non-YouTube) */}
                            {!isBlurred && (
                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <div className="w-full h-1.5 bg-gray-600 rounded-full mb-4 cursor-pointer relative">
                                        <div className="absolute top-0 left-0 h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>

                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-4">
                                            <button onClick={togglePlay} className="hover:text-primary-500 focus:outline-none transition">
                                                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                                            </button>
                                            <span className="text-sm font-medium">
                                                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button onClick={() => videoRef.current?.requestFullscreen()} className="hover:text-primary-500 focus:outline-none transition">
                                                <FaExpand size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Video Info */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentVideo?.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">{currentVideo?.description}</p>
                        </div>
                        {isYouTube && (
                            <a
                                href={currentVideo.url.replace('/embed/', '/watch?v=')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition"
                            >
                                <FaExternalLinkAlt size={10} /> Watch on YouTube
                            </a>
                        )}
                    </div>
                    {course && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-505 dark:text-gray-400">
                                Course: <span className="font-semibold text-gray-900 dark:text-white">{course.title}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            <div className="lg:w-1/3 flex flex-col gap-4">
                {/* Video Playlist */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaList className="text-primary-500" /> Course Videos
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {videoList.map((vid, idx) => (
                            <button
                                key={vid.id}
                                onClick={() => goToVideo(vid)}
                                className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${vid.id === currentVideo.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                    : 'hover:bg-gray-50 dark:hover:bg-dark-700 border border-transparent'
                                    }`}
                            >
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${vid.id === currentVideo.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-medium truncate ${vid.id === currentVideo.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                        {vid.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {Math.floor(vid.duration / 60)}:{(vid.duration % 60).toString().padStart(2, '0')} min
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs Panel */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex-1">
                    <Tabs
                        user={user}
                        videoId={currentVideo.id}
                        currentTime={currentTime}
                        onSeek={handleSeek}
                    />
                </div>
            </div>

        </div>
    );
};

const Tabs = ({ user, videoId, currentTime, onSeek }) => {
    const [activeTab, setActiveTab] = useState('bookmarks');
    const [showAddForm, setShowAddForm] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [customTimeInput, setCustomTimeInput] = useState('');
    const [editingBookmarkId, setEditingBookmarkId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Smart Notes State
    const [noteContent, setNoteContent] = useState('');

    // AI Tutor Chat State
    const [aiMessages, setAiMessages] = useState([
        { id: 'initial', sender: 'ai', text: 'Hi! Ask me to explain any concept from this video or generate a quick summary.' }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const chatEndRef = useRef(null);

    // AI Quiz State
    const { login } = useAuthStore();
    const [quizQuestions, setQuizQuestions] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);

    const queryClient = useQueryClient();

    // Auto-scroll AI chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages, activeTab]);

    const handleStartQuiz = async () => {
        setQuizLoading(true);
        setQuizQuestions(null);
        setQuizResult(null);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        try {
            const { data } = await axios.get(`${API}/tutor/quiz/${videoId}`, { withCredentials: true });
            setQuizQuestions(data);
        } catch (err) {
            console.error('Failed to load quiz:', err);
            alert('Failed to generate local/AI quiz content. Please try again.');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quizQuestions) return;

        let calculatedScore = 0;
        quizQuestions.forEach((q, idx) => {
            const chosen = selectedAnswers[idx];
            const correctPos = q.answerIndex !== undefined ? q.answerIndex : q.correctAnswer;
            if (chosen === correctPos) {
                calculatedScore++;
            }
        });

        setQuizLoading(true);
        try {
            const { data } = await axios.post(`${API}/tutor/quiz/score`, {
                score: calculatedScore,
                totalQuestions: quizQuestions.length
            }, { withCredentials: true });

            setQuizResult({
                score: calculatedScore,
                total: quizQuestions.length,
                xpEarned: data.xpEarned,
                newXp: data.newXp,
                newStreak: data.newStreak
            });

            if (user) {
                login({
                    ...user,
                    xp: data.newXp,
                    streak: data.newStreak
                });
            }
        } catch (err) {
            console.error('Failed to submit score:', err);
            alert('Encountered an issue saving score.');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleSendAiMessage = async (e) => {
        if (e) e.preventDefault();
        const message = aiInput.trim();
        if (!message) return;

        const userMessage = { id: Date.now().toString(), sender: 'user', text: message };
        setAiMessages(prev => [...prev, userMessage]);
        setAiInput('');
        setAiLoading(true);

        try {
            const { data } = await axios.post(`${API}/tutor`, {
                videoId,
                currentTime,
                message
            }, {
                withCredentials: true
            });

            const aiReply = { id: Date.now().toString() + '-ai', sender: 'ai', text: data.reply };
            setAiMessages(prev => [...prev, aiReply]);
        } catch (err) {
            console.error('AI Tutor error:', err);
            const errorReply = {
                id: Date.now().toString() + '-err',
                sender: 'ai',
                text: err.response?.data?.message || 'Sorry, I encountered an error. Please try again.'
            };
            setAiMessages(prev => [...prev, errorReply]);
        } finally {
            setAiLoading(false);
        }
    };


    // Fetch bookmarks for this specific video
    const { data: bookmarks = [], isLoading } = useQuery({
        queryKey: ['bookmarks', videoId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/bookmarks?videoId=${videoId}`, { withCredentials: true });
            return data;
        },
        enabled: !!videoId,
    });

    // Fetch notes for this specific video
    const { data: notes = [], isLoading: notesLoading } = useQuery({
        queryKey: ['notes', videoId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/notes`, { withCredentials: true });
            return (data || []).filter(n => n.videoId === videoId);
        },
        enabled: !!videoId,
    });

    // Create note mutation
    const createNoteMutation = useMutation({
        mutationFn: async (newNote) => {
            const { data } = await axios.post(`${API}/notes`, newNote, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notes', videoId]);
            setNoteContent('');
        }
    });

    // Delete note mutation
    const deleteNoteMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await axios.delete(`${API}/notes/${id}`, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notes', videoId]);
        }
    });

    const handleSaveNote = (e) => {
        e.preventDefault();
        if (!noteContent.trim()) return;

        createNoteMutation.mutate({
            videoId,
            timestamp: Math.floor(currentTime),
            content: noteContent.trim()
        });
    };

    // Create bookmark mutation
    const createMutation = useMutation({
        mutationFn: async (newBookmark) => {
            const { data } = await axios.post(`${API}/bookmarks`, newBookmark, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookmarks', videoId]);
            setTitleInput('');
            setShowAddForm(false);
        }
    });

    // Update bookmark mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, title }) => {
            const { data } = await axios.put(`${API}/bookmarks/${id}`, { title }, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookmarks', videoId]);
            setEditingBookmarkId(null);
        }
    });

    // Delete bookmark mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await axios.delete(`${API}/bookmarks/${id}`, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookmarks', videoId]);
        }
    });

    // Auto-populate current time when opening the form
    useEffect(() => {
        if (showAddForm) {
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
            setCustomTimeInput(`${minutes}:${seconds}`);
        }
    }, [showAddForm, currentTime]);

    const handleSaveBookmark = (e) => {
        e.preventDefault();

        let seconds = currentTime;
        if (customTimeInput) {
            const parts = customTimeInput.split(':');
            if (parts.length === 2) {
                seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            } else {
                seconds = parseInt(parts[0], 10) || currentTime;
            }
        }

        createMutation.mutate({
            videoId,
            timestamp: seconds,
            title: titleInput.trim()
        });
    };

    const formatTimestamp = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 pb-2">
                <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex-1 pb-1 font-semibold text-sm transition ${activeTab === 'bookmarks' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Bookmarks ({bookmarks.length})
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 pb-1 font-semibold text-sm transition ${activeTab === 'notes' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Smart Notes
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 pb-1 font-semibold text-sm transition ${activeTab === 'ai' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    AI Tutor
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
                {activeTab === 'bookmarks' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Save specific timestamps to jump back to.</span>
                            {!showAddForm && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                >
                                    + Add Bookmark
                                </button>
                            )}
                        </div>

                        {/* Add Bookmark Form */}
                        {showAddForm && (
                            <form onSubmit={handleSaveBookmark} className="bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Bookmark Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={titleInput}
                                        onChange={(e) => setTitleInput(e.target.value)}
                                        placeholder="e.g., Grid Layout Explanation"
                                        className="w-full p-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Timestamp</label>
                                        <input
                                            type="text"
                                            value={customTimeInput}
                                            onChange={(e) => setCustomTimeInput(e.target.value)}
                                            placeholder="MM:SS"
                                            className="w-full p-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center font-mono outline-none text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isLoading}
                                            className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Saved Bookmarks List */}
                        {isLoading ? (
                            <div className="flex justify-center py-6">
                                <FaSpinner className="animate-spin text-primary-500" />
                            </div>
                        ) : bookmarks.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50/50 dark:bg-dark-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-400">No bookmarks saved for this video.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {bookmarks.map((bookmark) => (
                                    <div
                                        key={bookmark.id}
                                        className="group relative flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-100 dark:hover:border-primary-900 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 pr-16">
                                            {/* Clickable timestamp badge */}
                                            <button
                                                onClick={() => onSeek(bookmark.timestamp)}
                                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-mono text-xs font-semibold hover:bg-primary-600 hover:text-white transition flex-shrink-0"
                                                title="Click to jump to bookmark"
                                            >
                                                <FaClock size={10} />
                                                {formatTimestamp(bookmark.timestamp)}
                                            </button>

                                            {/* Edit mode vs view mode */}
                                            {editingBookmarkId === bookmark.id ? (
                                                <div className="flex items-center gap-1.5 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        className="p-1 px-2 w-full text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded outline-none text-gray-900 dark:text-white"
                                                    />
                                                    <button
                                                        onClick={() => updateMutation.mutate({ id: bookmark.id, title: editingTitle })}
                                                        className="p-1 text-green-600 hover:text-green-700"
                                                    >
                                                        <FaCheck size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingBookmarkId(null)}
                                                        className="p-1 text-red-500 hover:text-red-600"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {bookmark.title}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {editingBookmarkId !== bookmark.id && (
                                            <div className="absolute right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingBookmarkId(bookmark.id);
                                                        setEditingTitle(bookmark.title);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition"
                                                >
                                                    <FaEdit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this bookmark?')) {
                                                            deleteMutation.mutate(bookmark.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        {/* Add Note Form */}
                        <form onSubmit={handleSaveNote} className="space-y-3">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="w-full h-24 p-3 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white text-sm"
                                placeholder="Take a note at current time (supports details)..."
                                required
                            />
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Note will be tagged at: <b className="font-mono">{formatTimestamp(currentTime)}</b></span>
                                <button
                                    type="submit"
                                    disabled={createNoteMutation.isPending}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer"
                                >
                                    Save Note
                                </button>
                            </div>
                        </form>

                        {/* List of saved notes */}
                        {notesLoading ? (
                            <div className="flex justify-center py-6">
                                <FaSpinner className="animate-spin text-primary-500" />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50/50 dark:bg-dark-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-400">No notes saved for this video.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mt-4 max-h-[220px] overflow-y-auto pr-1">
                                {notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="p-3 bg-gray-50 dark:bg-dark-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 relative group text-left"
                                    >
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => onSeek(note.timestamp)}
                                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-mono text-[10px] font-bold hover:bg-primary-600 hover:text-white transition cursor-pointer"
                                            >
                                                <FaClock size={8} />
                                                {formatTimestamp(note.timestamp)}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this note?')) {
                                                        deleteNoteMutation.mutate(note.id);
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                                            >
                                                <FaTrash size={10} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="flex flex-col h-[380px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        {quizLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-3">
                                <FaSpinner className="animate-spin text-3xl text-blue-500" />
                                <span className="text-sm font-semibold">Preparing your quiz...</span>
                            </div>
                        ) : quizResult ? (
                            /* Quiz Results View */
                            <div className="flex-1 flex flex-col h-full overflow-y-auto space-y-4">
                                <div className="bg-gradient-to-r from-blue-650 to-indigo-650 text-white p-4 rounded-xl text-center shadow-sm space-y-1">
                                    <h4 className="text-sm font-bold">🎉 Quiz Completed!</h4>
                                    <p className="text-2xl font-extrabold">{quizResult.score} / {quizResult.total}</p>
                                    <div className="flex justify-center gap-4 text-xs font-semibold pt-1 text-blue-100">
                                        <span>✨ +{quizResult.xpEarned} XP</span>
                                        <span>🔥 Streak: {quizResult.newStreak} days</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {quizQuestions.map((q, idx) => {
                                        const chosen = selectedAnswers[idx];
                                        const correctPos = q.answerIndex !== undefined ? q.answerIndex : q.correctAnswer;
                                        const isCorrect = chosen === correctPos;
                                        return (
                                            <div key={idx} className="bg-white dark:bg-dark-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-xs space-y-1.5 shadow-sm">
                                                <p className="font-bold text-gray-900 dark:text-white">{idx + 1}. {q.question}</p>
                                                <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                                    Your answer: {q.options[chosen] || 'None'} {isCorrect ? '✓' : '✗'}
                                                </p>
                                                {!isCorrect && (
                                                    <p className="text-green-600 font-semibold">Correct: {q.options[correctPos]}</p>
                                                )}
                                                {q.explanation && (
                                                    <p className="text-gray-500 dark:text-gray-450 italic bg-gray-50/50 dark:bg-dark-900/50 p-2 rounded mt-1">{q.explanation}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => {
                                        setQuizQuestions(null);
                                        setQuizResult(null);
                                    }}
                                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-650 text-white rounded-lg font-semibold text-xs transition mt-auto cursor-pointer"
                                >
                                    Back to AI Chat
                                </button>
                            </div>
                        ) : quizQuestions ? (
                            /* Live Quiz MCQ Card */
                            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Lesson Quiz</span>
                                    <span className="text-xs text-gray-400 font-mono">Q: {currentQuestionIdx + 1}/{quizQuestions.length}</span>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                                        {quizQuestions[currentQuestionIdx].question}
                                    </h4>
                                    <div className="space-y-2">
                                        {quizQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                                            const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: oIdx }))}
                                                    className={`w-full p-3 text-left text-xs rounded-xl border transition ${isSelected
                                                        ? 'bg-blue-500 border-blue-600 text-white font-bold shadow-sm'
                                                        : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border-gray-150 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    {currentQuestionIdx > 0 && (
                                        <button
                                            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                                            className="px-3 py-2 bg-gray-250 hover:bg-gray-350 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-750 dark:text-white text-xs font-semibold rounded-lg transition"
                                        >
                                            Back
                                        </button>
                                    )}
                                    {currentQuestionIdx < quizQuestions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                                            disabled={selectedAnswers[currentQuestionIdx] === undefined}
                                            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                        >
                                            Next Question
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmitQuiz}
                                            disabled={selectedAnswers[currentQuestionIdx] === undefined}
                                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                        >
                                            Submit Quiz
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Default chat view + Banner */
                            <>
                                <div className="mb-3 p-3 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <h4 className="text-xs font-bold flex items-center gap-1.5 leading-none">🧠 Challenge Yourself</h4>
                                        <p className="text-[10px] text-blue-10/90 mt-1">Take a quiz to earn XP and rank up!</p>
                                    </div>
                                    <button
                                        onClick={handleStartQuiz}
                                        disabled={quizLoading}
                                        className="text-xs py-1.5 px-3 bg-white text-blue-650 hover:bg-blue-50 font-bold rounded-lg transition disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-sm"
                                    >
                                        Start Quiz
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto mb-4 text-xs space-y-3 pr-1">
                                    {aiMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`p-3 rounded-xl max-w-[85%] border shadow-sm whitespace-pre-line ${msg.sender === 'user'
                                                    ? 'bg-blue-500 text-white border-blue-600'
                                                    : 'bg-white dark:bg-dark-800 text-gray-705 dark:text-gray-300 border-gray-100 dark:border-gray-700'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {aiLoading && (
                                        <div className="flex justify-start">
                                            <div className="p-3 bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2 text-gray-500">
                                                <FaSpinner className="animate-spin text-blue-500" />
                                                <span>Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={handleSendAiMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        placeholder="Ask AI..."
                                        className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-705 outline-none text-xs dark:bg-dark-900 dark:text-white"
                                        disabled={aiLoading}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 rounded-xl font-medium text-xs disabled:opacity-50"
                                        disabled={aiLoading || !aiInput.trim()}
                                    >
                                        Send
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayerView;
