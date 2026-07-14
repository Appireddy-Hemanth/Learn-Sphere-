import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaImage, FaStar, FaFire, FaCalendarAlt, FaSave, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const ProfilePage = () => {
    const { user, login } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await axios.put(`${API}/auth/profile`,
                { name, email, avatar },
                { withCredentials: true }
            );

            // Update auth store
            login({ ...user, name: data.name, email: data.email, avatar: data.avatar });
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-dark-900 transition-colors">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Back button */}
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition w-fit">
                    <FaArrowLeft /> Back to Dashboard
                </Link>

                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 md:p-8 border border-gray-150 dark:border-gray-700 shadow-sm space-y-8">

                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-3xl overflow-hidden border-2 border-primary-500 bg-primary-600 shadow-lg">
                                {avatar ? (
                                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    (name?.[0] || 'U').toUpperCase()
                                )}
                            </div>
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                            <h1 className="text-2xl font-bold text-gray-905 dark:text-white">{name || 'Your Profile'}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start">
                                <FaCalendarAlt /> Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                                <FaFire size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Daily Streak</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.streak || 0} Days</p>
                            </div>
                        </div>
                        <div className="bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-105 dark:border-yellow-900/30 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-450">
                                <FaStar size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-550 dark:text-gray-450 font-medium">Total Experience</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.xp || 0} XP</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSave} className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h3>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-650 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-xl text-sm">
                                {success}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Name input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-450">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaUser />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-900 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary-500 transition duration-150 text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-450">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaEnvelope />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-900 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary-500 transition duration-150 text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Avatar input */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-450">Avatar Image URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaImage />
                                    </div>
                                    <input
                                        type="url"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-900 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary-500 transition duration-150 text-sm"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.4)] transition cursor-pointer"
                            >
                                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
