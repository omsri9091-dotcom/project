import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentApi, predictionApi, recommendationApi } from '../../services/api';
import { Student, Prediction, Recommendation } from '../../types';
import { FeatureImportanceChart } from '../../components/charts/FeatureImportanceChart';
import {
  ArrowLeft,
  Sparkles,
  Award,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';

export const AdminStudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const fetchStudentData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await studentApi.getStudentById(id);
      if (res.success) {
        setStudent(res.data.student);
        setPredictions(res.data.predictions || []);
        setRecommendations(res.data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to retrieve student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const handleRunPrediction = async () => {
    if (!student) return;
    setPredicting(true);
    try {
      const res = await predictionApi.predict({
        studentId: student._id,
        attendance: student.attendance,
        studyHours: student.studyHours,
        previousMarks: student.previousMarks,
        assignmentScore: student.assignmentScore,
        internalMarks: student.internalMarks,
        previousGPA: student.previousGPA,
        participation: student.participation,
        backlogs: student.backlogs,
      });

      if (res.success) {
        await fetchStudentData();
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setPredicting(false);
    }
  };

  const handleToggleRec = async (recId: string) => {
    try {
      await recommendationApi.toggleStatus(recId);
      setRecommendations((prev) =>
        prev.map((r) => (r._id === recId ? { ...r, completed: !r.completed } : r))
      );
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  if (loading || !student) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">Loading student diagnostic dossier...</p>
        </div>
      </div>
    );
  }

  const latestPrediction = predictions[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cohort Directory</span>
        </Link>

        <button
          onClick={handleRunPrediction}
          disabled={predicting}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{predicting ? 'AI Evaluating...' : 'Re-Run AI Inference'}</span>
        </button>
      </div>

      {/* Profile Dossier Hero Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-[#070b14] flex items-center justify-center text-xl font-bold text-indigo-300">
                {student.name.charAt(0)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{student.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    student.riskLevel === 'High'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : student.riskLevel === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {student.riskLevel} Risk Profile
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ID: <strong className="text-indigo-400 font-mono">{student.studentId}</strong> • {student.email} • {student.department} (Semester {student.semester})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400">Current GPA</div>
              <div className="text-2xl font-extrabold text-white font-mono">{student.currentGPA.toFixed(2)}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400">Attendance</div>
              <div className={`text-2xl font-extrabold font-mono ${student.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {student.attendance}%
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-400">AI Score</div>
              <div className="text-2xl font-extrabold text-indigo-400 font-mono">{student.performanceScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Academic Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Attendance', val: `${student.attendance}%`, alert: student.attendance < 75 },
          { label: 'Study Hours', val: `${student.studyHours}h/d`, alert: student.studyHours < 3.0 },
          { label: 'Prev Marks', val: `${student.previousMarks}%`, alert: student.previousMarks < 50 },
          { label: 'Assignments', val: `${student.assignmentScore}%`, alert: student.assignmentScore < 60 },
          { label: 'Internals', val: `${student.internalMarks}%`, alert: student.internalMarks < 60 },
          { label: 'Prev GPA', val: student.previousGPA.toFixed(2), alert: false },
          { label: 'Participation', val: `${student.participation}/10`, alert: student.participation < 5 },
          { label: 'Backlogs', val: student.backlogs, alert: student.backlogs > 0 },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</span>
            <div className={`text-base font-extrabold mt-1 font-mono ${stat.alert ? 'text-rose-400' : 'text-white'}`}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      {/* Explainable AI & Factor Importance */}
      {latestPrediction?.factors && latestPrediction.factors.length > 0 && (
        <FeatureImportanceChart
          factors={latestPrediction.factors}
          title={`Explainable AI Diagnostic: ${student.name}`}
          subtitle="Feature importance weights computed by the Random Forest model for this student profile."
        />
      )}

      {/* Recommendations Checklist */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Prescribed Academic Interventions & Recommendations
            </h3>
          </div>
          <span className="text-xs text-slate-400">{recommendations.length} Action Items</span>
        </div>

        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-xs text-slate-500">No active recommendations for this student.</p>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec._id}
                onClick={() => handleToggleRec(rec._id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  rec.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-[#0e1726] border-slate-700/80 hover:border-indigo-500/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={rec.completed}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rec.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      rec.priority === 'CRITICAL' || rec.priority === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">• Impact: {rec.expectedImpact}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                  <p className="text-[11px] text-indigo-300 font-medium mt-1">Action: {rec.action}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historical Inferences Timeline */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">
          Inference & Prediction History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-800 bg-slate-900/40 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Predicted Class</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Model Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {predictions.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/20">
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-3 font-bold text-indigo-300">{p.performance}</td>
                  <td className="py-3 px-3 font-mono text-white">{p.score} / 100</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.riskLevel === 'High' ? 'text-rose-400 bg-rose-500/10' : p.riskLevel === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {p.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{Math.round(p.confidence * 100)}%</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{p.modelVersion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
