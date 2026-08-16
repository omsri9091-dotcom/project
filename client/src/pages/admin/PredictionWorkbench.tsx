import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentApi, predictionApi } from '../../services/api';
import { Student, Prediction, ModelMetrics } from '../../types';
import { FeatureImportanceChart } from '../../components/charts/FeatureImportanceChart';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Cpu,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  RotateCcw,
  Info,
} from 'lucide-react';

export const AdminPredictionWorkbench: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

  // Form Parameters
  const [attendance, setAttendance] = useState<number>(85);
  const [studyHours, setStudyHours] = useState<number>(4.0);
  const [previousMarks, setPreviousMarks] = useState<number>(78);
  const [assignmentScore, setAssignmentScore] = useState<number>(82);
  const [internalMarks, setInternalMarks] = useState<number>(76);
  const [previousGPA, setPreviousGPA] = useState<number>(8.0);
  const [participation, setParticipation] = useState<number>(8);
  const [backlogs, setBacklogs] = useState<number>(0);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [studRes, metricsRes] = await Promise.all([
          studentApi.getStudents({ limit: 100 }),
          predictionApi.getMetrics(),
        ]);
        if (studRes.success) setStudents(studRes.data);
        if (metricsRes.success) setMetrics(metricsRes.metrics);
      } catch (err) {
        console.error('Failed to load initial workbench data:', err);
      }
    };
    loadInitialData();
  }, []);

  // When a student is selected from dropdown, prefill inputs
  useEffect(() => {
    if (selectedStudentId) {
      const s = students.find((item) => item._id === selectedStudentId);
      if (s) {
        setAttendance(s.attendance);
        setStudyHours(s.studyHours);
        setPreviousMarks(s.previousMarks);
        setAssignmentScore(s.assignmentScore);
        setInternalMarks(s.internalMarks);
        setPreviousGPA(s.previousGPA);
        setParticipation(s.participation);
        setBacklogs(s.backlogs);
      }
    }
  }, [selectedStudentId, students]);

  const handleRunPrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        attendance,
        studyHours,
        previousMarks,
        assignmentScore,
        internalMarks,
        previousGPA,
        participation,
        backlogs,
      };

      if (selectedStudentId) {
        payload.studentId = selectedStudentId;
      }

      const res = await predictionApi.predict(payload);
      if (res.success && res.prediction) {
        setPrediction(res.prediction);
        if (res.prediction.performance === 'Excellent' || res.prediction.performance === 'Good') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedStudentId('');
    setAttendance(75);
    setStudyHours(3.5);
    setPreviousMarks(70);
    setAssignmentScore(75);
    setInternalMarks(70);
    setPreviousGPA(7.0);
    setParticipation(6);
    setBacklogs(0);
    setPrediction(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AI Performance Prediction Workbench
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Random Forest Classifier
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          From performance data to intelligent possibilities. Simulate academic parameters and inspect Explainable AI feature weights.
        </p>
      </div>

      {/* Model Health / Metrics Summary Bar */}
      {metrics && (
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Active Scikit-Learn Model:</span>
            <span className="text-xs text-indigo-300 font-mono">RandomForestClassifier (150 trees)</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Accuracy: </span>
              <strong className="text-emerald-400">{(metrics.accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400">Precision: </span>
              <strong className="text-indigo-300">{(metrics.precision * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400">Recall: </span>
              <strong className="text-indigo-300">{(metrics.recall * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400">F1-Score: </span>
              <strong className="text-indigo-300">{(metrics.f1_score * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs Form on Left & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Form (Left 5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Academic Feature Inputs</h3>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Student Selector Optional */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Select Enrolled Student (Optional)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">Custom Manual Simulation</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.studentId}) • Sem {s.semester}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleRunPrediction} className="space-y-4 text-xs">
            {/* Attendance Slider */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Lecture Attendance</span>
                <span className="font-mono text-indigo-400">{attendance}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="100"
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Study Hours Slider */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Daily Study Hours</span>
                <span className="font-mono text-indigo-400">{studyHours.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Previous Marks Slider */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Previous Semester Marks</span>
                <span className="font-mono text-indigo-400">{previousMarks}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="100"
                value={previousMarks}
                onChange={(e) => setPreviousMarks(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Internal Test (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={internalMarks}
                  onChange={(e) => setInternalMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Assignment Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assignmentScore}
                  onChange={(e) => setAssignmentScore(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Previous GPA (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={previousGPA}
                  onChange={(e) => setPreviousGPA(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={backlogs}
                  onChange={(e) => setBacklogs(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>AI is analyzing student performance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Run AI Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & XAI (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction ? (
            <div className="space-y-6 animate-fade-in">
              {/* Output Hero Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl bg-gradient-to-br from-[#0e1726] to-[#131f38] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                      Machine Learning Prediction
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                      {prediction.performance} Performance
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      {prediction.explanation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Composite Score</span>
                    <div className="text-4xl font-extrabold text-white font-mono mt-0.5">
                      {prediction.score}
                      <span className="text-sm text-slate-400 font-normal"> / 100</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {Math.round(prediction.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Evaluated Risk:</span>
                    <span
                      className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                        prediction.riskLevel === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : prediction.riskLevel === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {prediction.riskLevel} Risk
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">
                    Risk Index: {prediction.riskScore} / 100
                  </span>
                </div>
              </div>

              {/* Explainable AI Horizontal Chart */}
              {prediction.factors && prediction.factors.length > 0 && (
                <FeatureImportanceChart factors={prediction.factors} />
              )}

              {/* Action Recommendations Card */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AI Prescribed Early Interventions</span>
                  </h3>
                  <div className="space-y-3">
                    {prediction.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white">{rec.title}</span>
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-indigo-500/10 text-indigo-400 uppercase">
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">{rec.description}</p>
                        <p className="text-indigo-300 font-medium mt-1">Action: {rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] glass-card rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
              <BrainCircuit className="w-16 h-16 stroke-1 text-indigo-400/40 animate-pulse-subtle" />
              <h3 className="text-sm font-semibold text-slate-300">Prediction Engine Ready</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select a student or modify parameters on the left and click <strong>"Run AI Prediction"</strong> to invoke the live Random Forest model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
