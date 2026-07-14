import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';

const Login = lazy(() => import('./pages/Login'));
const Overview = lazy(() => import('./pages/Overview'));
const Users = lazy(() => import('./pages/Users'));
const Courses = lazy(() => import('./pages/Courses'));
const LearningPaths = lazy(() => import('./pages/LearningPaths'));
const BlogPosts = lazy(() => import('./pages/BlogPosts'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const InterviewQuestions = lazy(() => import('./pages/InterviewQuestions'));
const ExamQuestions = lazy(() => import('./pages/ExamQuestions'));
const AboutContent = lazy(() => import('./pages/AboutContent'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Suspense fallback={<PageLoader label="Loading…" />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Root ("/") is the statistics Overview — the whole app IS the
                admin dashboard, deployed on its own subdomain, so there's no
                nested /dashboard/overview path. */}
            <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/learning-paths" element={<ProtectedRoute><LearningPaths /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><BlogPosts /></ProtectedRoute>} />
            <Route path="/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
            <Route path="/interview-questions" element={<ProtectedRoute><InterviewQuestions /></ProtectedRoute>} />
            <Route path="/exam-questions" element={<ProtectedRoute><ExamQuestions /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><AboutContent /></ProtectedRoute>} />

            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}