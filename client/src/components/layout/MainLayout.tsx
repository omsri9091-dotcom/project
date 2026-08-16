import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { NotificationDrawer } from '../common/NotificationDrawer';

export const MainLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageHeader = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) {
      return {
        title: 'Academic Intelligence Dashboard',
        subtitle: 'Understand performance. Identify risk. Enable improvement.',
      };
    }
    if (path.includes('/admin/students')) {
      return {
        title: 'Student Cohort Directory',
        subtitle: 'Multi-factor records, performance evaluation, and intervention tracking.',
      };
    }
    if (path.includes('/admin/prediction')) {
      return {
        title: 'AI Performance Prediction Workbench',
        subtitle: 'From performance data to intelligent possibilities.',
      };
    }
    if (path.includes('/admin/analytics')) {
      return {
        title: 'Institutional Analytics & Insights',
        subtitle: 'Cross-departmental performance, risk distribution, and correlation trends.',
      };
    }
    if (path.includes('/admin/users')) {
      return {
        title: 'User & Access Management',
        subtitle: 'Role-based access control for faculty, administrators, and students.',
      };
    }
    if (path.includes('/student/dashboard')) {
      return {
        title: 'Your Performance, Your Possibility',
        subtitle: 'ADEXA AI helps you understand where you are and discover where you can go.',
      };
    }
    if (path.includes('/student/performance')) {
      return {
        title: 'Semester Performance Progression',
        subtitle: 'Longitudinal GPA, attendance dynamics, and academic growth analysis.',
      };
    }
    if (path.includes('/student/prediction')) {
      return {
        title: 'AI Performance Prediction',
        subtitle: 'From performance data to intelligent possibilities.',
      };
    }
    if (path.includes('/student/study-plan')) {
      return {
        title: 'AI Personalized Study Architecture',
        subtitle: 'Weekly adaptive calendar tailored to your target GPA and weak subjects.',
      };
    }
    if (path.includes('/student/recommendations')) {
      return {
        title: 'Turn Insights Into Action',
        subtitle: 'Personalized recommendations designed to help every student move toward greater possibilities.',
      };
    }
    if (path.includes('/student/assistant')) {
      return {
        title: 'ADEXA AI Assistant',
        subtitle: 'Your intelligent academic companion.',
      };
    }
    if (path.includes('/student/profile')) {
      return {
        title: 'Academic Profile Settings',
        subtitle: 'Manage your verified institutional details and profile preferences.',
      };
    }
    return {
      title: 'ADEXA AI Platform',
      subtitle: 'From Performance to Possibility',
    };
  };

  const header = getPageHeader();

  return (
    <div className="min-h-screen flex bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          title={header.title}
          subtitle={header.subtitle}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-[#090f1d] py-6 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">ADEXA AI</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-medium">From Performance to Possibility</span>
            </div>
            <p className="text-slate-500">
              © 2026 ADEXA AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer />
    </div>
  );
};
