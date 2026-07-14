import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/useAuthStore';
import { FaGraduationCap, FaMoon, FaSun, FaBell, FaCheck, FaVolumeMute, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const queryClient = useQueryClient();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    // Apply dark class to html element on mount if true
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Close notifications dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const newVal = !isDark;
        setIsDark(newVal);
        localStorage.setItem('theme', newVal ? 'dark' : 'light');
    };

    // Fetch notifications
    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/notifications`, { withCredentials: true });
            return data;
        },
        enabled: isAuthenticated,
        refetchInterval: 12050, // Poll every ~12 seconds
    });

    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    // Mark as read mutation
    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            return axios.put(`${API}/notifications/${id}/read`, {}, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Mark all as read mutation
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            return axios.put(`${API}/notifications/read-all`, {}, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <FaGraduationCap className="text-3xl text-primary-600" />
                        <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
                            LearnSphere <span className="text-primary-500">AI</span>
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/courses" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition">Courses</Link>

                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 transition text-gray-600 dark:text-gray-300 outline-none cursor-pointer">
                            {isDark ? <FaSun /> : <FaMoon />}
                        </button>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4 relative">
                                {user?.role === 'admin' ? (
                                    <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition font-semibold">Admin Panel</Link>
                                ) : (
                                    <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition">Dashboard</Link>
                                )}
                                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition">Profile</Link>

                                {/* Notification Bell */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 text-gray-655 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition focus:outline-none cursor-pointer"
                                    >
                                        <FaBell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-red-500 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown list */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-dark-900/40">
                                                <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => markAllReadMutation.mutate()}
                                                        disabled={markAllReadMutation.isPending}
                                                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline cursor-pointer disabled:opacity-50"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-105 dark:divide-gray-700/60">
                                                {notifications.length > 0 ? (
                                                    notifications.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => !item.isRead && markReadMutation.mutate(item.id)}
                                                            className={`p-4 flex gap-3 text-sm transition cursor-pointer select-none ${item.isRead ? 'hover:bg-slate-50 dark:hover:bg-dark-805/30' : 'bg-primary-50/20 dark:bg-primary-950/10 hover:bg-primary-50/40 dark:hover:bg-primary-950/20'}`}
                                                        >
                                                            <div className="flex-1">
                                                                <p className={`font-semibold text-gray-900 dark:text-white ${!item.isRead ? 'text-primary-655 dark:text-primary-400' : ''}`} >{item.title}</p>
                                                                <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs leading-relaxed">{item.message}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                </p>
                                                            </div>
                                                            {!item.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full self-center flex-shrink-0" />}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-gray-400 text-xs">
                                                        No notifications here.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <button onClick={logout} className="text-sm font-medium text-red-500 hover:text-red-600 transition cursor-pointer">Logout</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition flex items-center font-medium">Log In</Link>
                                <Link to="/register" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition font-medium shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
