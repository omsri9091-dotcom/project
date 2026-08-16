import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiApi } from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Zap,
  HelpCircle,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
}

export const StudentAssistantPage: React.FC = () => {
  const { user, studentProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello **${user?.name?.split(' ')[0] || 'Student'}**! I am your **ADEXA AI Academic Assistant**.\n\nI have active context of your academic performance profile (GPA: **${studentProfile?.currentGPA || 7.5}**, Attendance: **${studentProfile?.attendance || 82}%**, Risk Level: **${studentProfile?.riskLevel || 'Low'}**).\n\nHow can I help guide your academic journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'ADEXA Context Engine',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: 'Why is my performance evaluated as ' + (studentProfile?.performanceLevel || 'Good') + '?', icon: HelpCircle },
    { label: 'How can I improve my GPA this semester?', icon: TrendingUp },
    { label: 'What should I focus on this month?', icon: Zap },
    { label: 'Create an optimized study timetable for me.', icon: Calendar },
    { label: 'How to clear active backlogs effectively?', icon: AlertTriangle },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const res = await aiApi.chat({
        message: query,
        history: historyPayload,
      });

      if (res.success) {
        const assistantMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: res.provider,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'I encountered a brief connection issue. However, based on your active academic profile, focusing on 80%+ attendance and structured 90-minute daily review blocks will yield the highest GPA gains.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'ADEXA Intelligent Fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-card rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#090f1d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-glow-brand">
            <div className="w-full h-full rounded-[14px] bg-[#070b14] flex items-center justify-center text-cyan-300">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-tight">ADEXA AI Assistant</h2>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Active Context
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Your intelligent academic companion • From Performance to Possibility
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span>GPA: <strong className="text-white">{studentProfile?.currentGPA || 7.5}</strong></span>
          <span>•</span>
          <span>Attendance: <strong className="text-indigo-400">{studentProfile?.attendance || 82}%</strong></span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                isUser
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-cyan-300 border border-indigo-500/30'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                isUser
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#0d1527] border border-slate-800 text-slate-200 shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>

                <div className={`mt-2 text-[10px] flex items-center justify-between pt-1 border-t ${
                  isUser ? 'border-indigo-500/40 text-indigo-200' : 'border-slate-800/80 text-slate-500'
                }`}>
                  <span>{msg.timestamp}</span>
                  {msg.provider && <span className="font-mono">{msg.provider}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0d1527] border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              <span>ADEXA AI is analyzing your academic profile...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Prompts:</span>
        {suggestedPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.label)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Icon className="w-3 h-3 text-indigo-400" />
              <span className="truncate max-w-[200px]">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="p-3.5 sm:p-4 bg-[#090f1d] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask ADEXA AI anything about your grades, study plans, or risk factors..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-glow-brand transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
