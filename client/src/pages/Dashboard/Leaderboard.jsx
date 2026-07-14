import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaFire, FaStar, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const API = 'http://localhost:5000/api';

const Leaderboard = () => {
    const { user: currentUser } = useAuthStore();

    const { data: leaders = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/auth/leaderboard`, { withCredentials: true });
            return data;
        }
    });

    const getMedalColor = (rank) => {
        if (rank === 1) return 'text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]';
        if (rank === 2) return 'text-slate-350 drop-shadow-[0_2px_8px_rgba(156,163,175,0.4)]';
        if (rank === 3) return 'text-amber-600 drop-shadow-[0_2px_8px_rgba(217,119,6,0.4)]';
        return 'text-gray-400';
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <FaSpinner className="animate-spin text-4xl text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-dark-900 transition-colors">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back button */}
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition w-fit">
                    <FaArrowLeft /> Back to Dashboard
                </Link>

                {/* Banner */}
                <div className="bg-gradient-to-r from-primary-600 to-emerald-600 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
                    <div className="relative z-10 space-y-2">
                        <span className="bg-white/20 text-white font-semibold text-xs py-1 px-3 rounded-full">Gamification Mode Active</span>
                        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                            <FaTrophy className="text-yellow-350 animate-bounce" /> LearnSphere Leaderboard
                        </h1>
                        <p className="text-white/80 max-w-md">Learn, test your knowledge, increase your streak, and earn XP to rank up against fellow students!</p>
                    </div>
                    {/* Background decorations */}
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
                        <FaTrophy size={300} />
                    </div>
                </div>

                {/* Rankings Container */}
                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Students</h3>

                    {leaders.length === 0 ? (
                        <p className="text-center py-6 text-gray-500 dark:text-gray-400">No students matching records.</p>
                    ) : (
                        <div className="space-y-3">
                            {leaders.map((student, idx) => {
                                const rank = idx + 1;
                                const isSelf = student.id === currentUser?.id || student.email === currentUser?.email;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={student.id}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition duration-200 ${isSelf
                                            ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                                            : 'bg-gray-50/40 dark:bg-dark-900/40 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Medal / Rank Number */}
                                            <div className="w-8 flex items-center justify-center">
                                                {rank <= 3 ? (
                                                    <FaMedal size={24} className={getMedalColor(rank)} />
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 font-bold font-mono text-sm">{rank}</span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base overflow-hidden border ${isSelf ? 'border-primary-500 bg-primary-600' : 'border-gray-200 dark:border-gray-700 bg-gray-500'}`}>
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (student.name?.[0] || 'U').toUpperCase()
                                                    )}
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <div>
                                                <h4 className={`text-sm font-semibold flex items-center gap-2 ${isSelf ? 'text-primary-650 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {student.name || 'Student'} {isSelf && <span className="bg-primary-500 text-white text-[10px] py-0.5 px-2 rounded-full font-normal">You</span>}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Score / XP */}
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                                                <FaFire className="text-orange-500" />
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {student.streak || 0} days
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-[90px] justify-end">
                                                <FaStar className="text-yellow-400" />
                                                <span className="font-bold text-gray-900 dark:text-white-300 text-sm">
                                                    {student.xp || 0} XP
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Leaderboard;
