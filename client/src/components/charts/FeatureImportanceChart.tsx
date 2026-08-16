import React from 'react';
import { Factor } from '../../types';
import { Info, HelpCircle } from 'lucide-react';

interface FeatureImportanceChartProps {
  factors: Factor[];
  title?: string;
  subtitle?: string;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  factors,
  title = 'Explainable AI — Feature Importance Breakdown',
  subtitle = 'Why did the AI make this prediction?',
}) => {
  // Sort factors by importance descending
  const sortedFactors = [...factors].sort((a, b) => b.importance - a.importance);

  const getStatusBadge = (status: string, impact: string) => {
    if (status === 'Strong') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Strong
        </span>
      );
    }
    if (status === 'Moderate') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Moderate
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Needs Action
      </span>
    );
  };

  const getBarColor = (name: string, importance: number) => {
    if (importance >= 0.20) return 'from-indigo-500 to-blue-400';
    if (importance >= 0.12) return 'from-cyan-500 to-teal-400';
    return 'from-slate-500 to-indigo-400';
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              XAI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="text-xs text-indigo-400 font-mono flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Random Forest Relative Weights</span>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-4">
        {sortedFactors.map((factor, index) => {
          const percentage = Math.round(factor.importance * 100);
          return (
            <div key={factor.name || index} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {factor.name}
                  </span>
                  {getStatusBadge(factor.status, factor.impact)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Weight: {factor.importance.toFixed(3)}
                  </span>
                  <span className="font-bold text-indigo-300 font-mono w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Bar track and fill */}
              <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(
                    factor.name,
                    factor.importance
                  )} transition-all duration-700 ease-out shadow-sm`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Non-Causation Explainable AI Notice */}
      <div className="mt-6 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-slate-400 text-[11px]">
          <strong className="text-indigo-300 font-semibold">Model Interpretability Disclaimer:</strong>{' '}
          These factors represent the model's relative feature importance for this prediction. Feature importance reflects statistical correlation weights within the trained Random Forest ensemble and does not claim individual causation.
        </p>
      </div>
    </div>
  );
};
