import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi, predictionApi } from '../../services/api';
import { Student, Prediction, Recommendation } from '../../types';
import { FeatureImportanceChart } from '../../components/charts/FeatureImportanceChart';
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
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Fetch current student profile & predictions
        const res = await studentApi.getStudentById('me');
        if (res.success && res.data) {
          setStudent(res.data.student);
          setPredictions(res.data.predictions || []);
          setRecommendations(res.data.recommendations || []);
        }
      } catch (error) {
        console.error('Failed to load student dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const latestPrediction = predictions[0];
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  // Sample semester progression points
  const semesterProgression = [
    { sem: 'Sem 1', gpa: 6.8, attendance: 78 },
    { sem: 'Sem 2', gpa: 7.0, attendance: 80 },
    { sem: 'Sem 3', gpa: 7.2, attendance: 82 },
    { sem: 'Current', gpa: student?.currentGPA || 7.5, attendance: student?.attendance || 85 },
  ];

  return (
    <div className="space-y-8 pb-12">
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
              ADEXA AI helps you understand where you are and discover where you can go.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/assistant"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Assistant</span>
            </Link>

            <Link
              to="/student/prediction"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Run AI Prediction</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current GPA */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current GPA</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {student?.currentGPA ? student.currentGPA.toFixed(2) : '7.50'}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              / 10.0 Scale
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Previous GPA: <strong className="text-slate-200">{student?.previousGPA || '7.20'}</strong>
          </div>
        </div>

        {/* Lecture Attendance */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Lecture Attendance</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                (student?.attendance || 75) < 75 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {student?.attendance || 75}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              (75% Minimum Required)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Status:{' '}
            <strong className={(student?.attendance || 75) < 75 ? 'text-rose-400' : 'text-emerald-400'}>
              {(student?.attendance || 75) < 75 ? 'Attendance Deficit' : 'Eligible for Exams'}
            </strong>
          </div>
        </div>

        {/* AI Performance Score */}
        <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">Composite AI Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {student?.performanceScore || 78}
            </span>
            <span className="text-[11px] text-indigo-300 font-medium">/ 100 Index</span>
          </div>
          <div className="mt-3 text-[11px] text-indigo-300/80">
            Tier: <strong className="text-white font-bold">{student?.performanceLevel || 'Good'}</strong>
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
            <span>Intervention Status</span>
            <Link to="/student/recommendations" className="font-bold underline text-indigo-400 hover:text-indigo-300">
              View Actions →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Performance Progression Chart & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Longitudinal GPA Trend Chart */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Academic Progression Dynamics</span>
              </h3>
              <p className="text-xs text-slate-400">GPA and Attendance trend across semesters</p>
            </div>
            <Link
              to="/student/performance"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Detailed Trends →
            </Link>
          </div>

          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterProgression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
                <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[5, 10]} />
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
                  name="GPA (0-10)"
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
                Latest AI Prediction
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {latestPrediction ? `${Math.round(latestPrediction.confidence * 100)}% Conf` : 'Active'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Predicted: {student?.performanceLevel || 'Good'} Tier
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {latestPrediction?.explanation ||
                `Model predicts a composite performance rating of ${student?.performanceScore || 78}/100 based on your current study habits and assessment trajectory.`}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <Link
              to="/student/study-plan"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Generate AI Study Timetable</span>
            </Link>

            <Link
              to="/student/recommendations"
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-center block"
            >
              View Active Recommendations ({recommendations.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Explainable AI Factors (if prediction exists) */}
      {latestPrediction?.factors && latestPrediction.factors.length > 0 && (
        <FeatureImportanceChart
          factors={latestPrediction.factors}
          title="Explainable AI — Your Academic Factor Impact"
          subtitle="How your academic habits contribute to your ADEXA AI performance prediction."
        />
      )}
    </div>
  );
};
