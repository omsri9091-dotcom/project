import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showSubtitle?: boolean;
  clickable?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  showSubtitle = false,
  clickable = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-3 group select-none">
      {/* Visual Glyph: Geometric A with Growth Vector & AI Node */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-950 border border-indigo-500/30 p-1.5 shadow-glow-brand group-hover:border-indigo-400/60 transition-all duration-300 ${iconSizes[size]}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="growthGrad" x1="10" y1="28" x2="30" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Left Leg */}
          <path d="M10 32L20 8L24 16" stroke="url(#logoGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Right Leg */}
          <path d="M30 32L20 8" stroke="url(#logoGrad)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Growth Bar */}
          <path d="M14 24H27" stroke="url(#growthGrad)" strokeWidth="3" strokeLinecap="round" />
          {/* AI Apex Growth Node */}
          <circle cx="20" cy="8" r="3" fill="#06B6D4" />
          <circle cx="20" cy="8" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent font-sans ${textSizes[size]}`}>
            ADEXA
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-wide text-slate-400 font-medium whitespace-nowrap">
            From Performance to Possibility
          </span>
        )}
        {showSubtitle && (
          <span className="text-[11px] text-indigo-400 font-normal">
            Predict. Understand. Improve.
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return <Link to="/" className="inline-flex items-center no-underline">{content}</Link>;
  }

  return content;
};
