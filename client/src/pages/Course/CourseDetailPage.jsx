import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaPlayCircle, FaClock, FaArrowLeft, FaSpinner, FaStar, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    // Fetch Course details
    const { data, isLoading, error } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/courses/${courseId}`);
            return data;
        },
    });

    // Check enrollment status (only if logged in)
    const { data: enrollData, isLoading: enrollLoading } = useQuery({
        queryKey: ['enrollment-status', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/enrollments/${courseId}/status`, { withCredentials: true });
            return data;
        },
        enabled: isAuthenticated,
    });

    // Enroll Mutation
    const enrollMutation = useMutation({
        mutationFn: async () => {
            return axios.post(`${API}/enrollments/${courseId}`, {}, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollment-status', courseId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-courses'] });
        }
    });

    // Unenroll Mutation
    const unenrollMutation = useMutation({
        mutationFn: async () => {
            return axios.delete(`${API}/enrollments/${courseId}`, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollment-status', courseId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-courses'] });
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <FaSpinner className="animate-spin text-4xl text-primary-500" />
            </div>
        );
    }

    if (error || !data?.course) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-900 gap-4">
                <p className="text-gray-550 dark:text-gray-400 text-lg">Course not found</p>
                <Link to="/courses" className="text-primary-600 hover:underline">← Back to Courses</Link>
            </div>
        );
    }

    const { course, videos = [] } = data || {};
    const videoList = Array.isArray(videos) ? videos : [];
    const isEnrolled = !!enrollData?.enrolled;
    const progress = enrollData?.enrollment?.progress || 0;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-dark-900 transition-colors">
            {/* Course Hero */}
            <div className="relative">
                <div className="absolute inset-0 block h-full w-full">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <Link to="/courses" className="flex items-center gap-2 text-gray-300 hover:text-white transition w-fit mb-6">
                        <FaArrowLeft /> Back to Courses
                    </Link>
                    <div className="max-w-3xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary-600/80 text-white text-xs font-bold mb-4 uppercase tracking-wider">
                            {course.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{course.title}</h1>
                        <p className="text-gray-300 text-lg mb-6">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-6 text-gray-305 mb-6">
                            <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-400" />
                                <span className="font-semibold text-white">{course.rating?.toFixed(1)}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' : course.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                                {course.difficulty}
                            </span>
                            <span>{videoList.length} Videos</span>
                            <span className="font-bold text-primary-400 text-lg">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                        </div>

                        {/* Enrollment buttons */}
                        {isAuthenticated && (
                            <div className="flex flex-wrap items-center gap-4">
                                {isEnrolled ? (
                                    <>
                                        <Link
                                            to={`/course/${courseId}/video/${videoList[0]?.id}`}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
                                        >
                                            <FaPlayCircle /> Go to Course
                                        </Link>
                                        <button
                                            onClick={() => unenrollMutation.mutate()}
                                            disabled={unenrollMutation.isPending}
                                            className="flex items-center gap-2 px-5 py-3 border border-red-500/50 hover:bg-red-550/10 text-red-400 hover:text-red-300 rounded-xl font-semibold transition cursor-pointer"
                                        >
                                            <FaUserMinus /> {unenrollMutation.isPending ? 'Leaving...' : 'Unenroll'}
                                        </button>
                                        <div className="w-full max-w-xs mt-2">
                                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                                <span>Your Course Progress</span>
                                                <span className="font-semibold">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => enrollMutation.mutate()}
                                        disabled={enrollMutation.isPending}
                                        className="flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition hover:scale-[1.02] cursor-pointer"
                                    >
                                        <FaUserPlus /> {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Course'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Videos List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Content</h2>

                {videoList.length === 0 ? (
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-550 dark:text-gray-400">No videos have been added to this course yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {videoList.map((video, idx) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    to={isEnrolled ? `/course/${courseId}/video/${video.id}` : '#'}
                                    onClick={(e) => {
                                        if (!isEnrolled) {
                                            e.preventDefault();
                                            alert('Please enroll to watch this video!');
                                        }
                                    }}
                                    className={`group flex items-center gap-4 p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-gray-700 transition ${isEnrolled ? 'hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg' : 'opacity-65 cursor-not-allowed'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition flex-shrink-0">
                                        <FaPlayCircle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-955 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition truncate">
                                            {idx + 1}. {video.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{video.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
                                        <FaClock />
                                        <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-100 dark:border-gray-800">
                <CourseReviews courseId={courseId} isEnrolled={isEnrolled} authenticated={isAuthenticated} />
            </div>
        </div>
    );
};

// Course Reviews Component
const CourseReviews = ({ courseId, isEnrolled, authenticated }) => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['reviews', courseId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/reviews/${courseId}`);
            return data;
        }
    });

    const addReviewMutation = useMutation({
        mutationFn: async (reviewData) => {
            return axios.post(`${API}/reviews/${courseId}`, reviewData, { withCredentials: true });
        },
        onSuccess: () => {
            setComment('');
            setRating(5);
            queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Failed to submit review');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        addReviewMutation.mutate({ rating, comment });
    };

    if (isLoading) {
        return <div className="text-center text-gray-400 py-6">Loading reviews...</div>;
    }

    const reviewsList = Array.isArray(reviews) ? reviews : [];

    // Check if user already reviewed
    const hasReviewed = reviewsList.some(r => r.userId === user?._id);

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Student Reviews</h3>
                {reviewsList.length === 0 ? (
                    <p className="text-gray-550 dark:text-gray-405">No reviews yet. Be the first to share your thoughts!</p>
                ) : (
                    <div className="space-y-4">
                        {reviewsList.map((rev) => (
                            <div key={rev.id} className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                            {rev.user?.avatar ? (
                                                <img src={rev.user.avatar} alt={rev.user.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                (rev.user?.name?.[0] || 'U').toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{rev.user?.name || 'Deleted User'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <FaStar key={s} className={s <= rev.rating ? 'text-yellow-450' : 'text-gray-300 dark:text-gray-600'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-650 dark:text-gray-300 text-sm leading-relaxed">{rev.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {isEnrolled && !hasReviewed ? (
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Leave a Review</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-450 block mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-2xl transition focus:outline-none cursor-pointer"
                                        >
                                            <FaStar className={(hoverRating || rating) >= star ? 'text-yellow-405' : 'text-gray-305 dark:text-gray-600'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-450 block mb-2">Your Thoughts</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or dislike about this course?"
                                    className="block w-full px-3.5 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-900 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary-500 transition duration-150 text-sm resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={addReviewMutation.isPending}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition cursor-pointer"
                            >
                                {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                ) : isEnrolled && hasReviewed ? (
                    <div className="bg-primary-50/50 dark:bg-primary-950/10 border border-primary-100 dark:border-primary-900/30 rounded-2xl p-5 text-sm text-primary-700 dark:text-primary-300">
                        Thank you for reviewing this course! You've already submitted your feedback.
                    </div>
                ) : (
                    <div className="bg-slate-100 dark:bg-dark-800 border border-gray-150 dark:border-gray-700 rounded-2xl p-5 text-sm text-gray-500 dark:text-gray-400">
                        Only enrolled students can write course reviews.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetailPage;
