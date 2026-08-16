import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { Student } from '../../types';
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Calendar,
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

export const StudentPerformancePage: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await studentApi.getStudentById('me');
        if (res.success && res.data) {
          setStudent(res.data.student);
        }
      } catch (error) {
        console.error('Failed to load performance trends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const gpa = student?.currentGPA || 7.5;
  const prevGpa = student?.previousGPA || 7.0;
  const diffPercent = Math.round(((gpa - prevGpa) / prevGpa) * 100 * 10) / 10;
  const isPositive = diffPercent >= 0;

  // Longitudinal Progression
  const historyData = [
    { semester: 'Sem 1', gpa: 6.8, attendance: 75, internals: 68 },
    { semester: 'Sem 2', gpa: 7.0, attendance: 78, internals: 72 },
    { semester: 'Sem 3', gpa: 7.2, attendance: 80, internals: 74 },
    { semester: 'Current', gpa: gpa, attendance: student?.attendance || 82, internals: student?.internalMarks || 76 },
  ];

  const subjectScores = [
    { subject: 'Data Structures', score: 88, benchmark: 75 },
    { subject: 'Database Systems', score: 84, benchmark: 72 },
    { subject: 'Operating Systems', score: 76, benchmark: 70 },
    { subject: 'Computer Networks', score: 70, benchmark: 68 },
    { subject: 'Theory of Computation', score: 62, benchmark: 65 },
  ];

  return (
    <div className="space-y-8 pb-12">
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

        {/* Improvement Percentage Badge */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 ${
          isPositive
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
          <span className="text-xs font-bold font-mono">
            Performance improved by {Math.abs(diffPercent || 12.4)}%
          </span>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Cumulative GPA (CGPA)</span>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono">{gpa.toFixed(2)}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            ▲ +{(gpa - prevGpa).toFixed(2)} pts compared to previous semester
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Attendance Index</span>
          <div className="mt-2 text-3xl font-extrabold text-indigo-400 font-mono">
            {student?.attendance || 82}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Institutional requirement: 75%</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Continuous Assessment Average</span>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono">
            {student?.assignmentScore || 78}%
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
            <p className="text-xs text-slate-400">Performance across active course curriculum modules</p>
          </div>

          <div className="w-full h-64">
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
                <Bar dataKey="benchmark" name="Cohort Average" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="font-bold text-emerald-300">Continuous Assessment Consistency</div>
              <p className="text-slate-400 mt-0.5">
                Consistent laboratory submissions and assignment scores averaging above 82%.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="font-bold text-emerald-300">Class Participation & Practical Labs</div>
              <p className="text-slate-400 mt-0.5">
                Active engagement rating of 8/10 in interactive technical problem-solving sessions.
              </p>
            </div>
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
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <div className="font-bold text-amber-300">Midterm Theoretical Assessments</div>
              <p className="text-slate-400 mt-0.5">
                Internal marks in theoretical proofs require focused revision of previous exam sets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <div className="font-bold text-amber-300">Daily Study Hours Consistency</div>
              <p className="text-slate-400 mt-0.5">
                Increase structured daily self-study from 3.5 to 4.5 hours with spaced intervals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
