import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import { Student, Prediction, Recommendation } from '../../types';
import { FeatureImportanceChart } from '../../components/charts/FeatureImportanceChart';
import { CompleteProfileModal } from '../../components/student/CompleteProfileModal';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Clock,
  Bot,
  Zap,
  ShieldAlert,
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
} from 'recharts';

export const StudentDashboardPage: React.FC = () => {
  const { user, studentProfile, updateStudentProfile } = useAuth();
  const [student, setStudent] = useState<Student | null>(studentProfile);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMyProfile();
      if (res.success && res.data) {
        if (res.data.student) {
          setStudent(res.data.student);
          updateStudentProfile(res.data.student);
        }
        setPredictions(res.data.predictions || []);
        setRecommendations(res.data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const latestPrediction = predictions[0];
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const isCompleted = Boolean(student?.isProfileCompleted);

  // Dynamic progression data from student's actual semester history
  const progressionData = student?.semesterHistory && student.semesterHistory.length > 0
    ? student.semesterHistory.map((s) => ({
        sem: s.semester,
        gpa: s.gpa,
        attendance: s.attendance,
      }))
    : [
        { sem: `Sem ${(student?.semester || 1) - 1 || 1}`, gpa: student?.previousGPA || 0, attendance: student?.attendance || 0 },
        { sem: `Sem ${student?.semester || 1} (Current)`, gpa: student?.currentGPA || 0, attendance: student?.attendance || 0 },
      ];

  const handleProfileSaved = (updatedStudent: Student) => {
    setStudent(updatedStudent);
    fetchStudentData();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSuccess={handleProfileSaved}
        existingProfile={student}
      />

      {/* Personalized Welcome Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-[#0d1527] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Intelligence Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {student?.college ? `${student.college} • ` : ''}
              {student?.department || user?.department || 'Engineering'} • Semester {student?.semester || user?.semester || 1}
              {student?.studentId ? ` (${student.studentId})` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isCompleted && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Update Academic Profile</span>
              </button>
            )}

            <Link
              to="/student/assistant"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Assistant</span>
            </Link>

            {isCompleted && (
              <Link
                to="/student/prediction"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Run Simulation</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* UNCOMPLETED PROFILE ONBOARDING BANNER */}
      {!isCompleted && !loading && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-[#0f172a] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Profile Incomplete</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Your Academic Profile Is Not Completed Yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                To view your personalized predictive analytics, early risk diagnostics, semester GPA progression, and customized AI study schedules, please complete your student profile with your current marks and attendance.
              </p>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-glow-brand transition-all flex items-center gap-2.5 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Complete Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Checklist Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Enter Subject Marks & Grades</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Set Real Attendance & CGPA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Generate Instant AI Diagnostics</span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core KPI Cards */}
      {isCompleted ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current GPA */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Cumulative CGPA</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {student?.currentGPA ? student.currentGPA.toFixed(2) : '0.00'}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                / 10.0 Scale
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">
              Previous Semester GPA: <strong className="text-slate-200">{student?.previousGPA ? student.previousGPA.toFixed(2) : 'N/A'}</strong>
            </div>
          </div>

          {/* Lecture Attendance */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  (student?.attendance || 0) < 75 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {student?.attendance || 0}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                (75% Minimum Required)
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">
              Exam Status:{' '}
              <strong className={(student?.attendance || 0) < 75 ? 'text-rose-400' : 'text-emerald-400'}>
                {(student?.attendance || 0) < 75 ? 'Attendance Deficit Warning' : 'Eligible for Examination'}
              </strong>
            </div>
          </div>

          {/* AI Composite Performance Score */}
          <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-[#0d1527]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300">Composite AI Score</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {student?.performanceScore || 0}
              </span>
              <span className="text-[11px] text-indigo-300 font-medium">/ 100 Index</span>
            </div>
            <div className="mt-3 text-[11px] text-indigo-300/80">
              Evaluated Tier: <strong className="text-white font-bold">{student?.performanceLevel || 'Average'}</strong>
            </div>
          </div>

          {/* Assessed Risk Level */}
          <div
            className={`glass-card rounded-2xl p-5 border ${
              student?.riskLevel === 'High'
                ? 'border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-[#0d1527]'
                : student?.riskLevel === 'Medium'
                ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-[#0d1527]'
                : 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-[#0d1527]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Early Risk Level</span>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={`text-2xl font-extrabold uppercase tracking-wide ${
                  student?.riskLevel === 'High'
                    ? 'text-rose-400'
                    : student?.riskLevel === 'Medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {student?.riskLevel || 'Low'} Risk
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Backlogs: <strong>{student?.backlogs || 0}</strong></span>
              <Link to="/student/recommendations" className="font-bold underline text-indigo-400 hover:text-indigo-300">
                View Interventions →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Row 2: Performance Progression Chart & AI Summary (Only if completed) */}
      {isCompleted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Longitudinal Progression Chart */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Your Academic Progression Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">Actual GPA & Attendance trends across semesters</p>
              </div>
              <Link
                to="/student/performance"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Subject Mastery →
              </Link>
            </div>

            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
                  <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
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

          {/* AI Prediction Summary & Quick Action Card */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-indigo-500/20 bg-gradient-to-br from-[#0e1726] to-[#121c33] shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Personalized AI Diagnostic
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {latestPrediction ? `${Math.round(latestPrediction.confidence * 100)}% Confidence` : 'Active'}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white">
                Tier: {student?.performanceLevel || 'Good'} Standing
              </h3>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {latestPrediction?.explanation ||
                  `ADEXA model evaluated your performance at ${student?.performanceScore || 0}/100 based on ${student?.attendance || 0}% attendance, ${student?.studyHours || 0} hrs/day self-study, and ${student?.currentGPA || 0} CGPA.`}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <Link
                to="/student/study-plan"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Generate Adaptive Study Timetable</span>
              </Link>

              <Link
                to="/student/recommendations"
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-center block"
              >
                View Personalized Interventions ({recommendations.length})
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Enrolled Subjects Snapshot */}
      {isCompleted && student?.subjects && student.subjects.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Enrolled Curriculum Subjects & Recorded Marks</span>
            </h3>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Edit Subjects →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {student.subjects.map((sub, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white truncate max-w-[180px]">{sub.name}</div>
                  <div className="text-[10px] text-slate-400">Attendance: {sub.attendance ?? student.attendance}%</div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-extrabold font-mono ${
                    sub.score >= 80 ? 'text-emerald-400' : sub.score >= 60 ? 'text-indigo-400' : 'text-rose-400'
                  }`}>
                    {sub.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Explainable AI Factors (if prediction exists) */}
      {isCompleted && latestPrediction?.factors && latestPrediction.factors.length > 0 && (
        <FeatureImportanceChart
          factors={latestPrediction.factors}
          title="Explainable AI — Your Academic Factor Impact"
          subtitle="How your specific academic habits contribute to your ADEXA AI performance prediction."
        />
      )}
    </div>
  );
};
