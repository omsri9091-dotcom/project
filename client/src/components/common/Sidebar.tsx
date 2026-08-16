import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Bot,
  User,
  X,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, isAdmin } = useAuth();

  const adminLinks: NavItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Management', path: '/admin/students', icon: Users },
    { name: 'AI Prediction Workbench', path: '/admin/prediction', icon: Sparkles, badge: 'ML' },
    { name: 'Academic Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'User Management', path: '/admin/users', icon: ShieldCheck },
  ];

  const studentLinks: NavItem[] = [
    { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Performance Trends', path: '/student/performance', icon: TrendingUp },
    { name: 'AI Prediction', path: '/student/prediction', icon: Sparkles, badge: 'AI' },
    { name: 'AI Study Plan', path: '/student/study-plan', icon: Calendar },
    { name: 'Action Recommendations', path: '/student/recommendations', icon: CheckCircle2 },
    { name: 'AI Academic Assistant', path: '/student/assistant', icon: Bot, highlight: true },
    { name: 'My Profile', path: '/student/profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const sidebarContent = (
    <aside className="w-64 h-full bg-[#090f1d] border-r border-slate-800/80 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <Logo size="sm" showTagline={true} />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Banner */}
        <div className="px-4 py-3">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
            isAdmin
              ? 'bg-purple-950/20 border-purple-500/20 text-purple-300'
              : 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300'
          }`}>
            <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {isAdmin ? 'Faculty & Admin' : 'Student Portal'}
              </p>
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Authorized User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-glow-brand font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  } ${link.highlight ? 'ring-1 ring-indigo-500/20 bg-indigo-950/10' : ''}`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate">{link.name}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Brand Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
          <p className="text-[11px] font-bold text-white tracking-tight">ADEXA AI Platform</p>
          <p className="text-[10px] text-slate-400 mt-0.5">From Performance to Possibility</p>
          <p className="text-[9px] text-indigo-400 font-mono mt-1">v1.0.0 • ML Ready</p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
