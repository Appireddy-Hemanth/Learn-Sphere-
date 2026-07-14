import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FaPlayCircle, FaStar, FaFire, FaBookOpen, FaSpinner } from 'react-icons/fa';
import useAuthStore from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const StudentDashboard = () => {
    const { user } = useAuthStore();

    const { data: courses = [], isLoading: coursesLoading } = useQuery({
        queryKey: ['dashboard-courses'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/courses`);
            return data;
        },
    });

    const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
        queryKey: ['dashboard-enrollments'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/enrollments`, { withCredentials: true });
            return data;
        },
    });

    const { data: leaders = [], isLoading: leadersLoading } = useQuery({
        queryKey: ['leaderboard-top'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/auth/leaderboard`, { withCredentials: true });
            return data;
        }
    });

    const isLoading = coursesLoading || enrollmentsLoading;

    // Filter recommended courses: courses user is NOT enrolled in
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const recommendedCourses = courses.filter(c => !enrolledCourseIds.includes(c.id)).slice(0, 2);

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-dark-900 transition-colors">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.name || 'Student'}!
                        </h1>
                        <p className="text-gray-650 dark:text-gray-400 mt-1">Pick up where you left off and complete your daily goals.</p>
                    </div>
                    <div className="flex gap-4">
                        <StatsBadge icon={<FaFire className="text-orange-500" />} label="Streak" value={`${user?.streak || 0} Days`} />
                        <StatsBadge icon={<FaStar className="text-yellow-400" />} label="XP Points" value={`${user?.xp || 0} XP`} />
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <FaSpinner className="animate-spin text-3xl text-primary-500" />
                            </div>
                        ) : (
                            <>
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FaPlayCircle className="text-primary-500" /> Continue Watching
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {enrollments.length > 0 ? enrollments.map(enr => (
                                            <CourseCard
                                                key={enr.id}
                                                title={enr.course.title}
                                                progress={enr.progress}
                                                thumbnail={enr.course.thumbnail}
                                                to={`/course/${enr.course.id}`}
                                            />
                                        )) : (
                                            <p className="text-gray-500 dark:text-gray-400 col-span-2">No enrolled courses yet. <Link to="/courses" className="text-primary-600 hover:underline">Browse courses</Link></p>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FaBookOpen className="text-blue-500" /> Recommended Courses
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {recommendedCourses.length > 0 ? recommendedCourses.map(course => (
                                            <CourseCard
                                                key={course.id}
                                                title={course.title}
                                                progress={0}
                                                thumbnail={course.thumbnail}
                                                to={`/course/${course.id}`}
                                            />
                                        )) : (
                                            <p className="text-gray-500 dark:text-gray-400 col-span-2">All caught up! Check back later.</p>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Goal</h3>
                            <div className="bg-gray-50 dark:bg-dark-900 rounded-xl p-4">
                                <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-400">
                                    <span>Study 2 Hours</span>
                                    <span>1.5h / 2h</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <p className="text-xs text-center mt-3 text-gray-500">Just 30 minutes left to hit your daily goal!</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Leaders</h3>
                            <div className="space-y-4">
                                {leadersLoading ? (
                                    <div className="flex justify-center py-2">
                                        <FaSpinner className="animate-spin text-primary-500" />
                                    </div>
                                ) : leaders.length === 0 ? (
                                    <p className="text-xs text-gray-550 dark:text-gray-400">No active students.</p>
                                ) : (
                                    leaders.slice(0, 3).map((leader, i) => (
                                        <div key={leader.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 text-sm">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {leader.name} {leader.id === user?.id && " (You)"}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-orange-500">{leader.xp} XP</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link to="/leaderboard" className="block text-center w-full mt-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                                View Full Leaderboard
                            </Link>
                        </motion.div>
                    </div>


                </div>
            </div>
        </div>
    );
};

const StatsBadge = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 bg-white dark:bg-dark-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        {icon}
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const CourseCard = ({ title, progress, thumbnail, to }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition cursor-pointer"
        >
            <div className="h-40 overflow-hidden">
                <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <FaPlayCircle className="text-4xl text-white drop-shadow-md" />
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{title}</h3>
                {progress > 0 && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{progress}% Completed</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    </Link>
);

export default StudentDashboard;
