import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STUDENT'>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password, role });
      if (res.success) {
        if (res.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string, demoRole: 'ADMIN' | 'STUDENT') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo size="lg" showTagline={true} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Sign In to Your Intelligence Portal
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Select your institutional role to continue.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setRole('ADMIN');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ADMIN'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Faculty / Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('STUDENT');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'STUDENT'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'ADMIN' ? 'admin@adexa.ai' : 'student@adexa.ai'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-glow-brand transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Sign In as {role === 'ADMIN' ? 'Administrator' : 'Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Auto-Fill Section for Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>IBM Evaluator 1-Click Quick Fill:</span>
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemo('admin@adexa.ai', 'Admin@12345', 'ADMIN')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-purple-500/50 text-left text-purple-300 font-medium hover:bg-purple-950/20 transition-all"
              >
                <div className="font-bold">Faculty Admin</div>
                <div className="text-[10px] text-slate-400">admin@adexa.ai</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('rahul.sharma@adexa.ai', 'Student@12345', 'STUDENT')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-emerald-500/50 text-left text-emerald-300 font-medium hover:bg-emerald-950/20 transition-all"
              >
                <div className="font-bold">High Performer</div>
                <div className="text-[10px] text-slate-400">rahul.sharma@adexa.ai</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('amit.kumar@adexa.ai', 'Student@12345', 'STUDENT')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-amber-500/50 text-left text-amber-300 font-medium hover:bg-amber-950/20 transition-all"
              >
                <div className="font-bold">At-Risk Student</div>
                <div className="text-[10px] text-slate-400">amit.kumar@adexa.ai</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('neha.singh@adexa.ai', 'Student@12345', 'STUDENT')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-rose-500/50 text-left text-rose-300 font-medium hover:bg-rose-950/20 transition-all"
              >
                <div className="font-bold">Critical Risk</div>
                <div className="text-[10px] text-slate-400">neha.singh@adexa.ai</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
              Create student account
            </Link>
          </div>
        </div>

        {/* Tagline Footer */}
        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          Intelligent insights. Better decisions. Greater possibilities.
        </p>
      </div>
    </div>
  );
};
