import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaUsers, FaBook, FaVideo, FaChartLine, FaTrash, FaSpinner, FaBookOpen } from 'react-icons/fa';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const queryClient = useQueryClient();

    // Fetch Admin Stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/auth/admin/stats`, { withCredentials: true });
            return data;
        }
    });

    // Fetch Admin Users
    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/auth/admin/users`, { withCredentials: true });
            return data;
        }
    });

    // Fetch Admin Courses
    const { data: courses = [], isLoading: coursesLoading } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/courses`, { withCredentials: true });
            return data;
        }
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            return axios.delete(`${API}/auth/admin/users/${id}`, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    });

    // Delete Course Mutation
    const deleteCourseMutation = useMutation({
        mutationFn: async (id) => {
            return axios.delete(`${API}/courses/${id}`, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Failed to delete course');
        }
    });

    const isPageLoading = statsLoading || usersLoading || coursesLoading;

    if (isPageLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <FaSpinner className="animate-spin text-4xl text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-dark-900 transition-colors flex flex-col md:flex-row gap-6">

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit flex flex-col p-4 space-y-2">
                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white px-4 mb-4">Admin Panel</h2>

                <SidebarItem icon={<FaChartLine />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <SidebarItem icon={<FaUsers />} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <SidebarItem icon={<FaBook />} label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                <SidebarItem icon={<FaVideo />} label="Videos" active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">

                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-905 dark:text-white">Dashboard Overview</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Users" value={stats?.totalUsers || 0} color="bg-blue-500" />
                            <StatCard title="Total Courses" value={stats?.totalCourses || 0} color="bg-primary-500" />
                            <StatCard title="Videos Uploaded" value={stats?.totalVideos || 0} color="bg-purple-500" />
                            <StatCard title="Course Enrollments" value={stats?.totalEnrollments || 0} color="bg-amber-500" />
                        </div>

                        <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/35 rounded-2xl p-6 mt-8">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Estimated Value / Revenue</h4>
                            <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300">${(stats?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Calculated based on course enrollment fees or equivalent engagement metrics.</p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Manage Users</h3>
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-sm text-gray-650 dark:text-gray-450">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">XP Points</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                                                <td className="px-6 py-4">{item.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${item.role === 'admin' ? 'bg-indigo-120 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-900/30' : item.role === 'instructor' ? 'bg-purple-100 text-purple-700 dark:text-purple-300 dark:bg-purple-900/30' : 'bg-primary-100 text-primary-707 dark:text-primary-400 dark:bg-primary-900/30'}`}>
                                                        {item.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{item.xp} XP</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                                                deleteUserMutation.mutate(item.id);
                                                            }
                                                        }}
                                                        disabled={deleteUserMutation.isPending}
                                                        className="text-red-500 hover:text-red-700 transition cursor-pointer disabled:opacity-50"
                                                        title="Delete User"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'courses' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Manage Courses</h3>
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-sm text-gray-650 dark:text-gray-450">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Course</th>
                                        <th className="px-6 py-3">Instructor</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.length > 0 ? (
                                        courses.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-700" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                                            C
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{item.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.difficulty}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{item.instructor?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 text-xs">{item.category}</span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-950 dark:text-white">
                                                    {item.price === 0 ? 'Free' : `$${item.price}`}
                                                </td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                    <Link
                                                        to={`/course/${item.id}`}
                                                        className="text-primary-600 hover:text-primary-700 font-semibold text-xs transition"
                                                    >
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to delete the course "${item.title}"?`)) {
                                                                deleteCourseMutation.mutate(item.id);
                                                            }
                                                        }}
                                                        disabled={deleteCourseMutation.isPending}
                                                        className="text-red-500 hover:text-red-700 transition cursor-pointer disabled:opacity-50"
                                                        title="Delete Course"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No courses found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Placeholder for others */}
                {activeTab === 'videos' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 items-center justify-center text-gray-500">
                        Management UI for videos coming soon.
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'}`}
    >
        {icon} <span>{label}</span>
    </button>
);

const StatCard = ({ title, value, color }) => (
    <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 dark:opacity-20 ${color}`}></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

export default AdminDashboard;
