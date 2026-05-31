'use client';

interface ScoreBarProps {
  score: number;
  color: string;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<string, string> = {
  technical: 'bg-blue-500',
  fundamental: 'bg-emerald-500',
  supply: 'bg-violet-500',
  sentiment: 'bg-amber-500',
  composite: 'bg-gradient-to-r from-blue-500 to-emerald-500',
};

export default function ScoreBar({ score, color, label, showValue = true, size = 'sm' }: ScoreBarProps) {
  const barColor = COLOR_MAP[color] ?? 'bg-slate-500';
  const height = size === 'md' ? 'h-2.5' : 'h-1.5';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-slate-700/60 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-mono text-slate-300 w-8 text-right shrink-0">{score}</span>
      )}
    </div>
  );
}
