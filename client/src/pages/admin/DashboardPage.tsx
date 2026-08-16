import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, studentApi } from '../../services/api';
import { AnalyticsOverview } from '../../types';
import {
  PerformancePieChart,
  RiskBarChart,
  AttendanceGpaScatter,
  SemesterTrendLine,
} from '../../components/charts/PerformanceCharts';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  Download,
  Plus,
  Clock,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [perfData, setPerfData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, perfRes, riskRes] = await Promise.all([
        analyticsApi.getOverview({ department: deptFilter }),
        analyticsApi.getPerformance({ department: deptFilter }),
        analyticsApi.getRisk({ department: deptFilter }),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (perfRes.success) setPerfData(perfRes.data);
      if (riskRes.success) setRiskData(riskRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [deptFilter]);

  const handleExportCSV = async () => {
    try {
      const blob = await studentApi.exportCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'adexa_students_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('CSV Export failed:', error);
    }
  };

  if (loading && !overview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/60 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-800/40 rounded-2xl" />
          <div className="h-72 bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Academic Intelligence Dashboard</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              LIVE ML
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cohort diagnostics, predictive risk classification, and early intervention triage.
          </p>
        </div>

        {/* Quick Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Data Science">Data Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/admin/students"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Enrolled Cohort</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {overview?.totalStudents || 0}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center">
              Active Records
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Avg Attendance:</span>
            <strong className="text-slate-200 font-semibold">{overview?.averageAttendance}%</strong>
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-[#0d1527] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">High Risk Intervention</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 tracking-tight">
              {overview?.highRiskCount || 0}
            </span>
            <span className="text-[11px] text-rose-400 font-medium">
              Students (
              {overview?.totalStudents
                ? Math.round((overview.highRiskCount / overview.totalStudents) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-rose-300 flex items-center justify-between">
            <span>Requires Faculty Outreach</span>
            <Link to="/admin/students?riskLevel=High" className="font-bold underline hover:text-white">
              View List →
            </Link>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Moderate Risk</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {overview?.mediumRiskCount || 0}
            </span>
            <span className="text-[11px] text-amber-400/80 font-medium">
              Students (
              {overview?.totalStudents
                ? Math.round((overview.mediumRiskCount / overview.totalStudents) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-amber-300/80 flex items-center justify-between">
            <span>Monitor Attendance & Tests</span>
            <Link to="/admin/students?riskLevel=Medium" className="font-semibold underline hover:text-white">
              Filter →
            </Link>
          </div>
        </div>

        {/* Average GPA & Performance Index */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Cohort Average GPA</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {overview?.averageGPA || 0}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">/ 10.0 Scale</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Composite Score:</span>
            <strong className="text-slate-200 font-semibold">{overview?.averagePerformanceScore}/100</strong>
          </div>
        </div>
      </div>

      {/* Primary Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution Pie */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Performance Level Distribution
              </h3>
              <p className="text-xs text-slate-400">Random Forest composite classifications</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Cohort Bins</span>
          </div>
          {perfData?.perfDistribution ? (
            <PerformancePieChart data={perfData.perfDistribution} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading chart...</div>
          )}
        </div>

        {/* Risk Level Distribution Bar */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Academic Risk Breakdown
              </h3>
              <p className="text-xs text-slate-400">Low, Medium, and Critical Early Warning counts</p>
            </div>
            <span className="text-xs text-rose-400 font-mono">Triage Scale</span>
          </div>
          {perfData?.riskDistribution ? (
            <RiskBarChart data={perfData.riskDistribution} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading chart...</div>
          )}
        </div>
      </div>

      {/* Secondary Visualizations: Semester Progression & Attendance-GPA Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Performance Progression */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Semester-wise Performance & High Risk Trends
              </h3>
              <p className="text-xs text-slate-400">Cross-semester average score and risk count</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Sem 1 - 8</span>
          </div>
          {riskData?.semesterTrends ? (
            <SemesterTrendLine data={riskData.semesterTrends} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading trends...</div>
          )}
        </div>

        {/* Attendance vs Performance Score Correlation */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Attendance vs Composite Performance Index
              </h3>
              <p className="text-xs text-slate-400">Correlation scatter (Sample of student cohort)</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Multivariate</span>
          </div>
          {perfData?.scatterData ? (
            <AttendanceGpaScatter data={perfData.scatterData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading scatter...</div>
          )}
        </div>
      </div>

      {/* Bottom Row: High-Risk Students Alert Feed & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* High Risk Priority Feed */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-rose-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                High-Risk Intervention Priority Queue
              </h3>
            </div>
            <Link
              to="/admin/students?riskLevel=High"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-800/80 bg-slate-900/40">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">GPA</th>
                  <th className="py-2.5 px-3">Backlogs</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overview?.highRiskAlerts && overview.highRiskAlerts.length > 0 ? (
                  overview.highRiskAlerts.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.studentId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{student.department}</td>
                      <td className="py-3 px-3 font-semibold text-rose-400">
                        {student.attendance}%
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-200">{student.currentGPA}</td>
                      <td className="py-3 px-3 font-mono text-rose-400 font-bold">
                        {student.backlogs}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-medium transition-colors"
                        >
                          Diagnose
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No high-risk students found for selected department filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent AI Predictions Feed */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Recent AI Inferences
              </h3>
            </div>
            <Link
              to="/admin/prediction"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Workbench</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {overview?.recentPredictions && overview.recentPredictions.length > 0 ? (
              overview.recentPredictions.map((pred) => (
                <div
                  key={pred._id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white truncate">
                        {pred.studentName || pred.studentCode || 'Student'}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        pred.riskLevel === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : pred.riskLevel === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {pred.riskLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Predicted: <strong className="text-indigo-300">{pred.performance}</strong> ({pred.score}/100) • {Math.round(pred.confidence * 100)}% conf
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {new Date(pred.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent predictions logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
