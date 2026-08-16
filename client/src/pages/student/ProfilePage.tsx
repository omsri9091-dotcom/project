import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, studentApi } from '../../services/api';
import { Student } from '../../types';
import {
  User,
  Mail,
  BookOpen,
  Hash,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [semester, setSemester] = useState(user?.semester || 1);
  const [student, setStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentApi.getStudentById('me');
        if (res.success && res.data) {
          setStudent(res.data.student);
          setName(res.data.student.name);
          setDepartment(res.data.student.department);
          setSemester(res.data.student.semester);
        }
      } catch (error) {
        console.error('Failed to load profile details:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await authApi.updateProfile({ name, department, semester });
      if (res.success) {
        updateUser(res.user);
        setMessage({ type: 'success', text: 'Academic profile updated successfully.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Academic Profile & Verified Identity
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your enrolled institutional details and manage your verified preferences.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card & Badges (Left 4 cols) */}
        <div className="md:col-span-4 glass-card rounded-3xl p-6 border border-slate-800 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 mx-auto shadow-glow-brand">
            <div className="w-full h-full rounded-[22px] bg-[#070b14] flex items-center justify-center text-2xl font-extrabold text-indigo-300">
              {name ? name.charAt(0) : 'S'}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">{name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.studentId || student?.studentId || 'ADX-STUDENT'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Current CGPA:</span>
              <strong className="text-emerald-400 font-mono">{student?.currentGPA.toFixed(2) || '7.50'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Attendance:</span>
              <strong className="text-white font-mono">{student?.attendance || 82}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assessed Risk:</span>
              <strong className={student?.riskLevel === 'High' ? 'text-rose-400' : 'text-emerald-400'}>
                {student?.riskLevel || 'Low'}
              </strong>
            </div>
          </div>
        </div>

        {/* Profile Edit Form (Right 8 cols) */}
        <div className="md:col-span-8 glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Verified institutional email address cannot be edited.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
                  <option value="Data Science">Data Science & Analytics</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-glow-brand transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
