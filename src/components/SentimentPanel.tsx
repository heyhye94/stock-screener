'use client';
import { SentimentData } from '@/types';

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const color =
    value <= 25 ? 'text-red-400' :
    value <= 40 ? 'text-orange-400' :
    value <= 55 ? 'text-slate-300' :
    value <= 75 ? 'text-yellow-400' :
    'text-green-400';

  const bgColor =
    value <= 25 ? 'bg-red-500' :
    value <= 40 ? 'bg-orange-500' :
    value <= 55 ? 'bg-slate-400' :
    value <= 75 ? 'bg-yellow-500' :
    'bg-green-500';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">Fear &amp; Greed</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full ${bgColor}`} style={{ width: `${value}%` }} />
        </div>
        <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
      </div>
    </div>
  );
}

function VIXIndicator({ vix }: { vix: number | null }) {
  if (vix == null) return null;
  const color = vix > 30 ? 'text-red-400' : vix > 20 ? 'text-yellow-400' : 'text-green-400';
  const label = vix > 30 ? '공포' : vix > 20 ? '경계' : '안정';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">VIX</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full ${vix > 30 ? 'bg-red-500' : vix > 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min((vix / 50) * 100, 100)}%` }} />
        </div>
        <span className={`text-sm font-bold font-mono ${color}`}>{vix.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function SentimentPanel({ sentiment }: { sentiment: SentimentData }) {
  return (
    <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FearGreedGauge value={sentiment.fearGreed} label={sentiment.fearGreedLabel} />
      <VIXIndicator vix={sentiment.vix} />
    </div>
  );
}
