import React, { useState, useEffect } from 'react';
import { studentApi, predictionApi } from '../../services/api';
import { Student, Prediction } from '../../types';
import { FeatureImportanceChart } from '../../components/charts/FeatureImportanceChart';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentPredictionPage: React.FC = () => {
  const { studentProfile, updateStudentProfile } = useAuth();
  const [student, setStudent] = useState<Student | null>(studentProfile);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Editable Simulation Parameters
  const [attendance, setAttendance] = useState<number>(studentProfile?.attendance ?? 80);
  const [studyHours, setStudyHours] = useState<number>(studentProfile?.studyHours ?? 4.0);
  const [previousMarks, setPreviousMarks] = useState<number>(studentProfile?.previousMarks ?? 75);
  const [assignmentScore, setAssignmentScore] = useState<number>(studentProfile?.assignmentScore ?? 80);
  const [internalMarks, setInternalMarks] = useState<number>(studentProfile?.internalMarks ?? 75);
  const [previousGPA, setPreviousGPA] = useState<number>(studentProfile?.previousGPA ?? 7.5);
  const [participation, setParticipation] = useState<number>(studentProfile?.participation ?? 7);
  const [backlogs, setBacklogs] = useState<number>(studentProfile?.backlogs ?? 0);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await studentApi.getMyProfile();
        if (res.success && res.data) {
          const s = res.data.student;
          if (s) {
            setStudent(s);
            updateStudentProfile(s);
            setAttendance(s.attendance ?? 80);
            setStudyHours(s.studyHours ?? 4.0);
            setPreviousMarks(s.previousMarks ?? 75);
            setAssignmentScore(s.assignmentScore ?? 80);
            setInternalMarks(s.internalMarks ?? 75);
            setPreviousGPA(s.previousGPA ?? 7.5);
            setParticipation(s.participation ?? 7);
            setBacklogs(s.backlogs ?? 0);
          }

          if (res.data.predictions && res.data.predictions.length > 0) {
            setPrediction(res.data.predictions[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load student simulation profile:', error);
      }
    };
    fetchInitial();
  }, []);

  const handleRunPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await predictionApi.predict({
        attendance,
        studyHours,
        previousMarks,
        assignmentScore,
        internalMarks,
        previousGPA,
        participation,
        backlogs,
      });

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
    if (student) {
      setAttendance(student.attendance);
      setStudyHours(student.studyHours);
      setPreviousMarks(student.previousMarks);
      setAssignmentScore(student.assignmentScore);
      setInternalMarks(student.internalMarks);
      setPreviousGPA(student.previousGPA);
      setParticipation(student.participation);
      setBacklogs(student.backlogs);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>AI Performance Simulator & Predictor</span>
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          From performance data to intelligent possibilities. Adjust your academic habits below to simulate your future grades and early risk ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Form (Left 5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Adjust Your Academic Habits</h3>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleRunPrediction} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Lecture Attendance</span>
                <span className="font-mono text-indigo-400">{attendance}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Daily Self-Study Hours</span>
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

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Previous Semester Marks</span>
                <span className="font-mono text-indigo-400">{previousMarks}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="100"
                value={previousMarks}
                onChange={(e) => setPreviousMarks(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Internal Test Marks (%)</label>
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
                  <span>AI is predicting your trajectory...</span>
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

        {/* Prediction Results & Explainable AI (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction && (
            <div className="space-y-6 animate-fade-in">
              {/* Output Hero */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl bg-gradient-to-br from-[#0e1726] to-[#131f38] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                      Predicted Academic Trajectory
                    </span>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                      {prediction.performance} Performance
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      {prediction.explanation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Score</span>
                    <div className="text-4xl font-extrabold text-white font-mono mt-0.5">
                      {prediction.score}
                      <span className="text-sm text-slate-400 font-normal"> / 100</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {Math.round(prediction.confidence * 100)}% Model Confidence
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Risk Assessment:</span>
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

                  <Link
                    to="/student/study-plan"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Build Study Schedule →</span>
                  </Link>
                </div>
              </div>

              {/* Explainable AI Component */}
              {prediction.factors && prediction.factors.length > 0 && (
                <FeatureImportanceChart
                  factors={prediction.factors}
                  title="Explainable AI — Your Contributing Factors"
                  subtitle="How each academic indicator influenced this prediction."
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
