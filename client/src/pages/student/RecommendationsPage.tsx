import React, { useState, useEffect } from 'react';
import { recommendationApi } from '../../services/api';
import { Recommendation } from '../../types';
import {
  CheckCircle2,
  Sparkles,
  AlertOctagon,
  Clock,
  BookOpen,
  ArrowUpRight,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';

export const StudentRecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await recommendationApi.getByStudent('me');
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await recommendationApi.toggleStatus(id);
      setRecommendations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, completed: !r.completed } : r))
      );
    } catch (error) {
      console.error('Failed to update recommendation status:', error);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await recommendationApi.generate({});
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (error) {
      console.error('Failed to regenerate recommendations:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const completedCount = recommendations.filter((r) => r.completed).length;
  const progressPercent = recommendations.length > 0
    ? Math.round((completedCount / recommendations.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Turn Insights Into Action
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Personalized recommendations designed to help every student move from current performance toward greater possibilities.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating && 'animate-spin'}`} />
          <span>{regenerating ? 'Regenerating...' : 'Regenerate Actions'}</span>
        </button>
      </div>

      {/* Progress Track Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Intervention Completion Progress</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {completedCount} / {recommendations.length} Completed ({progressPercent}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Completing these actions directly mitigates early risk factors identified by the AI model.
          </p>
        </div>

        {/* Bar */}
        <div className="w-full sm:w-64 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-2" />
            <span>Analyzing student metrics...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-500 border border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 stroke-1 mx-auto text-emerald-400 opacity-60" />
            <h3 className="text-sm font-bold text-slate-300">All Interventions Cleared</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your academic indicators are currently in optimal standing. Click "Regenerate Actions" to request higher-level research pathways.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec._id}
              onClick={() => handleToggle(rec._id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                rec.completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'glass-card border-slate-800 hover:border-indigo-500/50 shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <input
                  type="checkbox"
                  checked={rec.completed}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 shrink-0"
                />

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold ${rec.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {rec.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : rec.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                      {rec.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] text-indigo-300 font-medium">
                    <strong className="text-slate-300">Action Plan: </strong>
                    {rec.action}
                  </div>
                </div>
              </div>

              {/* Expected Impact Tag */}
              <div className="sm:self-center shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{rec.expectedImpact}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
