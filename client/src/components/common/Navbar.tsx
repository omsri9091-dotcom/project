import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Logo } from './Logo';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  title,
  subtitle,
}) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, setIsDrawerOpen } = useNotification();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-4">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:block">
          {title ? (
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-slate-400 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
          ) : (
            <Logo size="sm" showTagline={true} />
          )}
        </div>

        <div className="sm:hidden">
          <Logo size="sm" showTagline={false} />
        </div>
      </div>

      {/* Right section: theme toggle, notifications, profile */}
      <div className="flex items-center gap-3">
        {/* Quick AI Predictor badge for students/admins */}
        <Link
          to={isAdmin ? '/admin/prediction' : '/student/prediction'}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400 transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AI Prediction Engine</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all duration-200"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Notification Bell */}
        {user && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all duration-200"
            title="View notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-glow-rose animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Profile Avatar / Menu */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all duration-200 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-[7px] bg-[#070b14] flex items-center justify-center text-xs font-bold text-indigo-300 uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {user.role === 'ADMIN' ? 'Administrator' : user.studentId || 'Student'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0d1527] border border-slate-800 shadow-2xl py-2 z-50 animate-fade-in divide-y divide-slate-800/60">
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {user.role}
                    </span>
                    {user.department && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        • {user.department}
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  {user.role === 'STUDENT' && (
                    <Link
                      to="/student/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/10 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Academic Profile</span>
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin/users"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>User Management</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-glow-brand transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
