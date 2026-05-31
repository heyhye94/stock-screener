'use client';
import ScoreBar from './ScoreBar';
import { ScoreBreakdown as IScoreBreakdown } from '@/types';

const AXES = [
  { key: 'technical' as const, label: '기술적', weight: '35%', color: 'technical' },
  { key: 'fundamental' as const, label: '기본적', weight: '20%', color: 'fundamental' },
  { key: 'supply' as const, label: '수급', weight: '30%', color: 'supply' },
  { key: 'sentiment' as const, label: '센티먼트', weight: '15%', color: 'sentiment' },
];

export default function ScoreBreakdown({ scores }: { scores: IScoreBreakdown }) {
  return (
    <div className="space-y-2">
      {AXES.map(({ key, label, weight, color }) => (
        <div key={key} className="flex items-center gap-3">
          <div className="w-20 shrink-0">
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-xs text-slate-600 ml-1">{weight}</span>
          </div>
          <div className="flex-1">
            <ScoreBar score={scores[key]} color={color} size="md" />
          </div>
        </div>
      ))}
    </div>
  );
}
