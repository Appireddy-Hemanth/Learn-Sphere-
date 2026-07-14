import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaSearch, FaPlayCircle, FaStar, FaFilter, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const fetchCourses = async (keyword = '') => {
    const { data } = await axios.get(`${API}/courses`, { params: keyword ? { keyword } : {} });
    return data;
};

const CoursesPage = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    const { data: courses = [], isLoading, error } = useQuery({
        queryKey: ['courses'],
        queryFn: () => fetchCourses(),
    });

    const categories = ['All', ...new Set(courses.map(c => c.category))];
    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const filtered = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-dark-900 transition-colors">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-blue-700 py-16 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Explore Our Courses
                    </h1>
                    <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                        Level up your skills with expert-led courses in web development, data science, design, and more.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 dark:bg-dark-800 text-gray-900 dark:text-white outline-none shadow-xl backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-primary-400 transition"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8 items-center">
                    <FaFilter className="text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex gap-2">
                        {difficulties.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedDifficulty === diff
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <FaSpinner className="animate-spin text-4xl text-primary-500" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20">
                        <p className="text-red-500 text-lg">Failed to load courses. Make sure the server is running.</p>
                        <p className="text-gray-400 mt-2 text-sm">{error.message}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No courses found. Try a different search or filter.</p>
                    </div>
                )}

                {/* Course Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((course, idx) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <CourseCard course={course} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const CourseCard = ({ course }) => (
    <Link to={`/course/${course.id}`}>
        <motion.div
            whileHover={{ y: -6 }}
            className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer h-full flex flex-col"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <FaPlayCircle className="text-5xl text-white drop-shadow-lg" />
                </div>
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[course.difficulty] || ''}`}>
                    {course.difficulty}
                </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">{course.category}</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">{course.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    {course.instructor && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">by {course.instructor.name}</span>
                    )}
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {course.price > 0 ? `$${course.price}` : 'Free'}
                    </span>
                </div>
            </div>
        </motion.div>
    </Link>
);

export default CoursesPage;
