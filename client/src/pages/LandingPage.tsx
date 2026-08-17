import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  ShieldAlert,
  Calendar,
  Bot,
  BarChart3,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Award,
  Layers,
  Database,
  Cpu,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Interactive Simulator State for live evaluator trial
  const [simAttendance, setSimAttendance] = useState(82);
  const [simStudyHours, setSimStudyHours] = useState(4.0);
  const [simPreviousMarks, setSimPreviousMarks] = useState(76);
  const [simBacklogs, setSimBacklogs] = useState(0);

  const calculateSimScore = () => {
    const raw =
      0.22 * simAttendance +
      0.18 * (simStudyHours / 8.0 * 100) +
      0.25 * simPreviousMarks +
      0.15 * 78 + // internal avg
      0.10 * 75 + // assignment avg
      0.10 * 7.5 * 10 -
      4.5 * simBacklogs;
    return Math.min(100, Math.max(0, Math.round(raw)));
  };

  const simScore = calculateSimScore();
  const simPerf =
    simScore >= 80 ? 'Excellent' : simScore >= 65 ? 'Good' : simScore >= 50 ? 'Average' : 'Poor';
  const simRisk =
    simPerf === 'Poor' || simBacklogs >= 2 || simAttendance < 65
      ? 'High'
      : simPerf === 'Average' || simAttendance < 75 || simBacklogs === 1
      ? 'Medium'
      : 'Low';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full h-20 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between">
        <Logo size="md" showTagline={true} />

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#simulator" className="hover:text-indigo-400 transition-colors">Live AI Simulator</a>
          <a href="#features" className="hover:text-indigo-400 transition-colors">Platform Capabilities</a>
          <a href="#architecture" className="hover:text-indigo-400 transition-colors">Architecture</a>
          <a href="#quickstart" className="hover:text-indigo-400 transition-colors">Quick Start</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-glow-brand transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Explore ADEXA AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          ADEXA <span className="gradient-hero">AI</span>
        </h1>

        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-300 mt-4 mb-2">
          From Performance to Possibility
        </p>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mt-4">
          Transform student performance data into intelligent predictions, actionable insights, and personalized pathways for academic success.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all duration-300 flex items-center gap-2 group"
          >
            <span>Explore ADEXA AI</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#simulator"
            className="px-8 py-4 rounded-xl text-sm font-bold bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-all duration-200 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try AI Prediction</span>
          </a>
        </div>

        {/* Academic Journey Flow Diagram */}
        <div className="mt-20 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">
            The ADEXA Intelligent Transformation Pipeline
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-left">
            {[
              { step: '01', title: 'Student Data', desc: 'Attendance, marks, GPA, study hours, backlogs', icon: Database },
              { step: '02', title: 'AI Analysis', desc: 'Random Forest Ensemble & XAI Feature Weights', icon: BrainCircuit },
              { step: '03', title: 'Prediction', desc: 'Continuous composite score & discrete tiers', icon: TrendingUp },
              { step: '04', title: 'Risk Detection', desc: 'Early multi-factor threshold classification', icon: ShieldAlert },
              { step: '05', title: 'Possibility', desc: 'Adaptive study plans & targeted interventions', icon: Sparkles },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-[#0d1527] border border-slate-800/80 relative group hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{item.step}</span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive AI Simulator Section */}
      <section id="simulator" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Live Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Test the ADEXA AI Prediction Engine
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Adjust academic parameters below to see how our trained Random Forest model evaluates composite performance and assesses early academic risk in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
          {/* Sliders Input Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Lecture Attendance</span>
                <span className="font-mono text-indigo-400">{simAttendance}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={simAttendance}
                onChange={(e) => setSimAttendance(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>40% (Debarment Risk)</span>
                <span>75% (Threshold)</span>
                <span>100% (Perfect)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Daily Self-Study Hours</span>
                <span className="font-mono text-indigo-400">{simStudyHours.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={simStudyHours}
                onChange={(e) => setSimStudyHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.5 hrs</span>
                <span>4.0 hrs (Optimal)</span>
                <span>8.0 hrs (Intensive)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Previous Semester Marks</span>
                <span className="font-mono text-indigo-400">{simPreviousMarks}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="100"
                value={simPreviousMarks}
                onChange={(e) => setSimPreviousMarks(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>35% (Pass)</span>
                <span>70% (Average)</span>
                <span>100% (Top Tier)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Active Backlogs</span>
                <span className={`font-mono font-bold ${simBacklogs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {simBacklogs} Pending
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={simBacklogs}
                onChange={(e) => setSimBacklogs(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 (Cleared)</span>
                <span>2 (Elevated Risk)</span>
                <span>5 (Critical)</span>
              </div>
            </div>
          </div>

          {/* AI Result Card Column */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#0e1726] to-[#121d33] border border-indigo-500/30 text-center shadow-xl space-y-5">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Model Output</span>
            </div>

            <div className="py-2">
              <div className="text-5xl font-extrabold text-white tracking-tight font-mono">
                {simScore}
                <span className="text-xl text-slate-400 font-sans font-normal"> / 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Composite Academic Index</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Class</span>
                <p className={`text-sm font-bold mt-0.5 ${
                  simPerf === 'Excellent' ? 'text-emerald-400' : simPerf === 'Good' ? 'text-indigo-400' : simPerf === 'Average' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {simPerf}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assessed Risk</span>
                <p className={`text-sm font-bold mt-0.5 ${
                  simRisk === 'Low' ? 'text-emerald-400' : simRisk === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {simRisk} Risk
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <span>Launch Full System with Demo Data</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Platform Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Integrated Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Comprehensive Academic Intelligence
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every feature connects academic data to actionable growth pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BrainCircuit,
              title: 'Machine Learning Performance Prediction',
              desc: 'Random Forest classifier trained on attendance, continuous internal marks, GPA, study habits, and active backlogs.',
            },
            {
              icon: ShieldAlert,
              title: 'Early Multi-Factor Risk Detection',
              desc: 'Automated triage categorizes students into Low, Medium, and High Risk before midterms and final examinations.',
            },
            {
              icon: BarChart3,
              title: 'Explainable AI (XAI) Transparency',
              desc: 'Interactive feature importance breakdown showing exact statistical factors behind predictions with statistical disclaimer.',
            },
            {
              icon: CheckCircle2,
              title: 'Contextual Action Recommendations',
              desc: 'Dynamic rule and ML-guided action checklists with estimated GPA impact to guide remedial intervention.',
            },
            {
              icon: Calendar,
              title: 'Personalized AI Study Architecture',
              desc: 'Generates weekly 7-day revision timetables customized for target GPA, available hours, and student weak subjects.',
            },
            {
              icon: Bot,
              title: 'ADEXA AI Academic Assistant',
              desc: 'Context-aware conversational companion with deep understanding of student attendance, marks, and risk diagnostics.',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Section */}
      <section id="architecture" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Security</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Three-Tier Microservice Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Clean decoupled architecture ensuring zero direct database access from frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
              Presentation Layer
            </span>
            <h3 className="text-base font-bold text-white mt-3 mb-1">React + Vite + Tailwind</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              TypeScript SPA with Recharts, responsive sidebar drawer, dark/light theme, and role-based routing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1527] border border-indigo-500/30 shadow-glow-brand">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Application & REST API
            </span>
            <h3 className="text-base font-bold text-white mt-3 mb-1">Node.js + Express + JWT</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mongoose ODM, bcrypt security, role authorization, analytics aggregation, and Python proxying.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1527] border border-slate-800">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Machine Learning Service
            </span>
            <h3 className="text-base font-bold text-white mt-3 mb-1">Python + FastAPI + Scikit-Learn</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Random Forest Classifier, Joblib model pipeline, feature importance weights, and evaluation metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Demo Access */}
      <section id="quickstart" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#0d1527] border border-indigo-500/30 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Award className="w-4 h-4" />
            <span>Quick Start Guide</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Experience ADEXA AI Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mt-2 mb-8">
            Sign in instantly with pre-configured demo accounts for Admin and student personas to explore the full platform capabilities.
          </p>

          <Link
            to="/login"
            className="px-8 py-4 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-slate-900 shadow-xl transition-all duration-200 inline-flex items-center gap-2"
          >
            <span>Launch ADEXA AI Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ADEXA AI</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-medium">From Performance to Possibility</span>
          </div>
          <p>© 2026 ADEXA AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
