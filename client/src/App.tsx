import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Guards & Layouts
import { ProtectedRoute, AdminRoute, StudentRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { AdminStudentsPage } from './pages/admin/StudentsPage';
import { AdminStudentDetailPage } from './pages/admin/StudentDetailPage';
import { AdminPredictionWorkbench } from './pages/admin/PredictionWorkbench';
import { AdminAnalyticsPage } from './pages/admin/AnalyticsPage';
import { AdminUsersPage } from './pages/admin/UsersPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/DashboardPage';
import { StudentPerformancePage } from './pages/student/PerformancePage';
import { StudentPredictionPage } from './pages/student/PredictionPage';
import { StudentStudyPlanPage } from './pages/student/StudyPlanPage';
import { StudentRecommendationsPage } from './pages/student/RecommendationsPage';
import { StudentAssistantPage } from './pages/student/AssistantPage';
import { StudentProfilePage } from './pages/student/ProfilePage';

export const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Admin Portal Protected Routes */}
              <Route element={<AdminRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/students" element={<AdminStudentsPage />} />
                  <Route path="/admin/students/:id" element={<AdminStudentDetailPage />} />
                  <Route path="/admin/prediction" element={<AdminPredictionWorkbench />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
              </Route>

              {/* Student Portal Protected Routes */}
              <Route element={<StudentRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                  <Route path="/student/performance" element={<StudentPerformancePage />} />
                  <Route path="/student/prediction" element={<StudentPredictionPage />} />
                  <Route path="/student/study-plan" element={<StudentStudyPlanPage />} />
                  <Route path="/student/recommendations" element={<StudentRecommendationsPage />} />
                  <Route path="/student/assistant" element={<StudentAssistantPage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
