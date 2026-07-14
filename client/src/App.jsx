import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import Leaderboard from './pages/Dashboard/Leaderboard';
import ProfilePage from './pages/Dashboard/ProfilePage';
import CoursesPage from './pages/Course/CoursesPage';
import CourseDetailPage from './pages/Course/CourseDetailPage';
import VideoPlayerView from './pages/Course/VideoPlayerView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
        <Navbar />
        <main className="pt-16">
          <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center text-gray-900 dark:text-white">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetailPage />} />
              <Route path="/course/:courseId/video/:videoId" element={<VideoPlayerView />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
