import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaPlayCircle, FaCertificate, FaArrowRight } from 'react-icons/fa';

const Landing = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white dark:from-dark-900 dark:to-dark-800"></div>
                    {/* Animated background blobs */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl pointer-events-none"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-10 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Master the Future with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-500">
                                LearnSphere AI
                            </span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                            The next-generation Learning Management System powered by AI. Generate smart notes, take quizzes, and chat with your personal AI tutor while you learn.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register" className="px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg transition shadow-[0_0_20px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2">
                                Get Started <FaArrowRight />
                            </Link>
                            <Link to="/courses" className="px-8 py-4 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition font-semibold text-lg flex justify-center items-center gap-2">
                                Browse Courses <FaPlayCircle />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-dark-900 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Why Choose LearnSphere?</h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Everything you need to accelerate your learning journey.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FaRobot className="text-4xl text-blue-500" />}
                            title="AI Learning Assistant"
                            desc="Ask questions, generate summaries, and clarify complex topics instantly while watching videos."
                        />
                        <FeatureCard
                            icon={<FaPlayCircle className="text-4xl text-primary-500" />}
                            title="Smart Video Player"
                            desc="Timestamped bookmarks, rich-text notes synced to video, and auto-resume built right in."
                        />
                        <FeatureCard
                            icon={<FaCertificate className="text-4xl text-purple-500" />}
                            title="Certificates & Quizzes"
                            desc="Test your knowledge with auto-generated assignments and earn verifiable certificates."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="p-8 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{desc}</p>
    </motion.div>
);

export default Landing;
