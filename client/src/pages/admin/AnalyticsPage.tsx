import React, { useState, useEffect } from 'react';
import { analyticsApi, studentApi } from '../../services/api';
import {
  PerformancePieChart,
  RiskBarChart,
  AttendanceGpaScatter,
  SemesterTrendLine,
} from '../../components/charts/PerformanceCharts';
import {
  BarChart3,
  Download,
  Filter,
  Layers,
  Award,
  TrendingDown,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const [department, setDepartment] = useState('ALL');
  const [semester, setSemester] = useState('ALL');
  const [perfData, setPerfData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [perfRes, riskRes] = await Promise.all([
        analyticsApi.getPerformance({ department, semester }),
        analyticsApi.getRisk({ department }),
      ]);
      if (perfRes.success) setPerfData(perfRes.data);
      if (riskRes.success) setRiskData(riskRes.data);
    } catch (error) {
      console.error('Analytics fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [department, semester]);

  const handleExportCSV = async () => {
    try {
      const blob = await studentApi.exportCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'adexa_analytics_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Academic Performance & Risk Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive multi-dimensional correlations across departments, semesters, and risk classifications.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Filter Analytics:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Department:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Data Science">Data Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Semester:</span>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 1: GPA Bins & Performance Tier Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution Histogram */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cohort GPA Distribution Bins
            </h3>
            <p className="text-xs text-slate-400">Number of students within respective grade point intervals</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData?.gpaBins || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1527',
                    borderColor: '#1f2e4d',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Level Distribution */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Predicted Performance Class Proportions
            </h3>
            <p className="text-xs text-slate-400">Poor, Average, Good, and Excellent distributions</p>
          </div>
          {perfData?.perfDistribution ? (
            <PerformancePieChart data={perfData.perfDistribution} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading...</div>
          )}
        </div>
      </div>

      {/* Row 2: Backlogs Impact & Department Risk Cross-Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backlogs vs Average Performance */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Active Backlogs vs Average Performance Score
            </h3>
            <p className="text-xs text-slate-400">Impact of backlog accumulation on composite score</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData?.backlogTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" opacity={0.5} />
                <XAxis dataKey="backlogs" stroke="#94a3b8" fontSize={11} />
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
                <Bar dataKey="avgPerformance" name="Avg Score" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Risk Distribution Table */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Departmental Risk Triage Breakdown
            </h3>
            <p className="text-xs text-slate-400">Cross-department high-risk proportions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-800 bg-slate-900/40">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3">Avg Score</th>
                  <th className="py-2.5 px-3">High Risk %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {riskData?.departmentRisk && riskData.departmentRisk.length > 0 ? (
                  riskData.departmentRisk.map((dept: any) => (
                    <tr key={dept.department} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">{dept.department}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">{dept.total}</td>
                      <td className="py-2.5 px-3 text-indigo-300 font-mono">{dept.avgScore}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-mono font-bold ${dept.highRiskRate > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {dept.highRiskRate}% ({dept.high})
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">Loading department data...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
