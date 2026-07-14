import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { withCredentials: true });
            login(data);
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-dark-900 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white dark:bg-dark-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl"
            >
                <h2 className="text-3xl font-display font-bold text-center text-gray-900 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Login to continue learning</p>

                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900 dark:text-white"
                                placeholder="Ex: student@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition text-gray-900 dark:text-white"
                                placeholder="********"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        Sign In <FaSignInAlt />
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                    Don't have an account? <Link to="/register" className="text-primary-500 hover:underline font-medium">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
