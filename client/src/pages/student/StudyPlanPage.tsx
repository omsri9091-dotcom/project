import React, { useState, useEffect } from 'react';
import { studyPlanApi, studentApi } from '../../services/api';
import { StudyPlan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Sparkles,
  Clock,
  BookOpen,
  Target,
  CheckCircle2,
  CalendarDays,
  Flame,
  Zap,
} from 'lucide-react';

export const StudentStudyPlanPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  // Form Inputs
  const [targetGPA, setTargetGPA] = useState<number>(() => {
    return studentProfile?.currentGPA ? Math.min(10, Math.round((studentProfile.currentGPA + 0.5) * 10) / 10) : 8.5;
  });
  const [examDate, setExamDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [availableHours, setAvailableHours] = useState<number>(() => studentProfile?.studyHours || 4);
  const [weakSubjectsInput, setWeakSubjectsInput] = useState<string>(() => {
    if (studentProfile?.subjects && studentProfile.subjects.length > 0) {
      const weak = studentProfile.subjects.filter((s) => s.score < 80);
      const list = weak.length > 0 ? weak : studentProfile.subjects;
      return list.map((s) => s.name).join(', ');
    }
    return '';
  });
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const fetchExistingPlan = async () => {
    setLoading(true);
    try {
      const res = await studyPlanApi.getByStudent('me');
      if (res.success && res.data) {
        setStudyPlan(res.data);
        setTargetGPA(res.data.targetGPA);
        setAvailableHours(res.data.availableHours);
        if (res.data.weakSubjects && res.data.weakSubjects.length > 0) {
          setWeakSubjectsInput(res.data.weakSubjects.join(', '));
        }
      }
    } catch (error) {
      console.error('Failed to load study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingPlan();
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const subjectsArray = weakSubjectsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await studyPlanApi.create({
        targetGPA: Number(targetGPA),
        examDate,
        availableHours: Number(availableHours),
        weakSubjects: subjectsArray,
      });

      if (res.success && res.data) {
        setStudyPlan(res.data);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      console.error('Failed to generate study plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const activeDayPlan = studyPlan?.plan?.find((p) => p.day === selectedDay) || studyPlan?.plan?.[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>AI Personalized Study Architecture</span>
          <Calendar className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate an adaptive, high-yield weekly revision schedule tailored to your target GPA and exam milestones.
        </p>
      </div>

      {/* Generator Configuration Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Semester GPA</span>
              </label>
              <input
                type="number"
                min="5.0"
                max="10.0"
                step="0.1"
                required
                value={targetGPA}
                onChange={(e) => setTargetGPA(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upcoming Exam Date</span>
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Available Hours</span>
              </label>
              <select
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="2">2.0 Hours / Day (Light)</option>
                <option value="3">3.0 Hours / Day (Standard)</option>
                <option value="4">4.0 Hours / Day (Recommended)</option>
                <option value="5">5.0 Hours / Day (Intensive)</option>
                <option value="6">6.0 Hours / Day (Exam Mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Focus / Weak Subjects</span>
              </label>
              <input
                type="text"
                value={weakSubjectsInput}
                onChange={(e) => setWeakSubjectsInput(e.target.value)}
                placeholder="Comma-separated subjects..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Generating personalized study plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate Adaptive Study Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Weekly Schedule Display */}
      {studyPlan && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">AI Strategy: </strong>
              {studyPlan.summary}
            </p>
          </div>

          {/* Days of Week Tab Switcher */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                    selectedDay === day
                      ? 'bg-indigo-600 text-white shadow-glow-brand'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono">{day.slice(0, 3)}</span>
                  <span className="text-xs">{day}</span>
                </button>
              )
            )}
          </div>

          {/* Selected Day Schedule Timeline */}
          {activeDayPlan && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{activeDayPlan.day} Revision Timeline</span>
                </h3>
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  {activeDayPlan.totalHours} Hours Total Allocation
                </span>
              </div>

              <div className="space-y-4">
                {activeDayPlan.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.subject}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 font-mono">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-300 font-medium mt-1">{item.activity}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.focus}</p>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto shrink-0">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
