'use client';
import { Signal } from '@/types';

const CONFIG: Record<Signal, { label: string; className: string }> = {
  strong_buy: { label: '강한 매수', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  watch: { label: '관망/분할매수', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  no_signal: { label: '신호 없음', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

export default function SignalBadge({ signal }: { signal: Signal }) {
  const { label, className } = CONFIG[signal];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
      {signal === 'strong_buy' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 live-dot" />}
      {label}
    </span>
  );
}
