import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { Student } from '../../types';
import { CompleteProfileModal } from '../../components/student/CompleteProfileModal';
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart2,
  BookOpen,
  Sparkles,
  Edit3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

import { useAuth } from '../../context/AuthContext';

export const StudentPerformancePage: React.FC = () => {
  const { studentProfile, updateStudentProfile } = useAuth();
  const [student, setStudent] = useState<Student | null>(studentProfile);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMyProfile();
      if (res.success && res.data) {
        setStudent(res.data.student);
        if (res.data.student) {
          updateStudentProfile(res.data.student);
        }
      }
    } catch (error) {
      console.error('Failed to load performance trends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (studentProfile) {
      setStudent(studentProfile);
    }
  }, [studentProfile]);

  const isCompleted = Boolean(student?.isProfileCompleted);
  const gpa = student?.currentGPA || 0;
  const prevGpa = student?.previousGPA || 0;
  const diffPercent = prevGpa > 0
    ? Math.round(((gpa - prevGpa) / prevGpa) * 100 * 10) / 10
    : 0;
  const isPositive = diffPercent >= 0;

  // Dynamic Semester History
  const historyData = student?.semesterHistory && student.semesterHistory.length > 0
    ? student.semesterHistory.map((s) => ({
        semester: s.semester,
        gpa: s.gpa,
        attendance: s.attendance,
        internals: student.internalMarks ?? 0,
      }))
    : [
        { semester: `Sem ${(student?.semester || 1) - 1 || 1}`, gpa: prevGpa, attendance: student?.attendance || 0, internals: student?.internalMarks ?? 0 },
        { semester: `Sem ${student?.semester || 1} (Current)`, gpa: gpa, attendance: student?.attendance || 0, internals: student?.internalMarks ?? 0 },
      ];

  // Dynamic Subject Scores from real student records
  const subjectScores = (student?.subjects && student.subjects.length > 0)
    ? student.subjects.map((sub) => ({
        subject: sub.name,
        score: sub.score,
        benchmark: 72,
      }))
    : [];

  // Identify real strongest and weakest subjects
  const sortedSubjects = [...(student?.subjects || [])].sort((a, b) => b.score - a.score);
  const strongSubjects = sortedSubjects.filter((s) => s.score >= 75);
  const focusSubjects = sortedSubjects.filter((s) => s.score < 75);

  return (
    <div className="space-y-8 pb-12">
      <CompleteProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(updated) => {
          setStudent(updated);
          fetchProfile();
        }}
        existingProfile={student}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Semester-Wise Academic Growth
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your semester GPA trajectory, internal assessments, and core subject benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Edit Records' : 'Complete Profile'}</span>
          </button>

          {isCompleted && (
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
              <span className="text-xs font-bold font-mono">
                {diffPercent !== 0 ? `${isPositive ? '+' : ''}${diffPercent}% vs Previous Sem` : 'Baseline Recorded'}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isCompleted && !loading && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-slate-900/80 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Academic Records Available Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Complete your student profile with your current subjects, marks, and attendance to view your growth analysis.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-glow-brand"
          >
            Enter Academic Data
          </button>
        </div>
      )}

      {isCompleted && (
        <>
          {/* Row 1: Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Cumulative GPA (CGPA)</span>
              <div className="mt-2 text-3xl font-extrabold text-white font-mono">{gpa.toFixed(2)}</div>
              <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                {prevGpa > 0 ? `Previous SGPA: ${prevGpa.toFixed(2)}` : 'Current semester evaluation'}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Attendance Index</span>
              <div className="mt-2 text-3xl font-extrabold text-indigo-400 font-mono">
                {student?.attendance || 0}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Institutional requirement: 75%</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Continuous Assessment Average</span>
              <div className="mt-2 text-3xl font-extrabold text-white font-mono">
                {student?.assignmentScore || student?.internalMarks || 0}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lab reports & regular submissions</p>
            </div>
          </div>

          {/* Row 2: Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPA & Attendance Trends Line Chart */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Semester GPA & Attendance Progression
                </h3>
                <p className="text-xs text-slate-400">Longitudinal view across enrolled semesters</p>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
                    <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1527',
                        borderColor: '#1f2e4d',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      name="GPA (0-10 Scale)"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Scores vs Institutional Cohort Benchmark */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Subject Mastery vs Class Benchmark
                </h3>
                <p className="text-xs text-slate-400">Performance across your enrolled curriculum modules</p>
              </div>

              <div className="w-full h-64">
                {subjectScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
                      <XAxis dataKey="subject" stroke="#94a3b8" fontSize={9} interval={0} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0d1527',
                          borderColor: '#1f2e4d',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                      <Bar dataKey="score" name="Your Score (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="benchmark" name="Cohort Benchmark (%)" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No subject records added yet. Click "Edit Records" to add subjects.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Strengths vs Focus Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strongest Areas */}
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Strongest Academic Areas
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {strongSubjects.length > 0 ? (
                  strongSubjects.slice(0, 2).map((sub, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                      <div className="font-bold text-emerald-300">{sub.name} ({sub.score}%)</div>
                      <p className="text-slate-400 mt-0.5">
                        High mastery level demonstrated. Above cohort benchmark with solid conceptual grounding.
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                    <div className="font-bold text-emerald-300">Attendance Index ({student?.attendance}%)</div>
                    <p className="text-slate-400 mt-0.5">
                      Maintained consistent class attendance supporting examination clearance.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Areas Requiring Improvement */}
            <div className="glass-card rounded-3xl p-6 border border-amber-500/20 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Areas Requiring Improvement
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {focusSubjects.length > 0 ? (
                  focusSubjects.slice(0, 2).map((sub, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                      <div className="font-bold text-amber-300">{sub.name} ({sub.score}%)</div>
                      <p className="text-slate-400 mt-0.5">
                        Target this unit during daily revision intervals to increase final assessment standing.
                      </p>
                    </div>
                  ))
                ) : student?.backlogs && student.backlogs > 0 ? (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                    <div className="font-bold text-amber-300">Backlog Clearance ({student.backlogs} Pending)</div>
                    <p className="text-slate-400 mt-0.5">
                      Clear prerequisite backlogs to stabilize overall CGPA.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                    <div className="font-bold text-amber-300">Advanced Project Work & Research</div>
                    <p className="text-slate-400 mt-0.5">
                      Elevate self-study into open-source contributions and competitive coding.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
