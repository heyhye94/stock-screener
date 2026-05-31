'use client';
import { useState } from 'react';
import { StockResult, Signal } from '@/types';
import SignalBadge from './SignalBadge';
import ScoreBar from './ScoreBar';
import ScoreBreakdown from './ScoreBreakdown';

type SortKey = 'composite' | 'technical' | 'fundamental' | 'supply' | 'sentiment' | 'changePercent';

const SIGNAL_ORDER: Record<Signal, number> = { strong_buy: 0, watch: 1, no_signal: 2 };

export default function StockTable({
  stocks,
  filterSignal,
}: {
  stocks: StockResult[];
  filterSignal: 'all' | 'strong_buy' | 'watch';
}) {
  const [sortKey, setSortKey] = useState<SortKey>('composite');
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = stocks.filter(s => {
    if (filterSignal === 'strong_buy') return s.signal === 'strong_buy';
    if (filterSignal === 'watch') return s.signal === 'strong_buy' || s.signal === 'watch';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortKey === 'composite') diff = a.scores.composite - b.scores.composite;
    else if (sortKey === 'technical') diff = a.scores.technical - b.scores.technical;
    else if (sortKey === 'fundamental') diff = a.scores.fundamental - b.scores.fundamental;
    else if (sortKey === 'supply') diff = a.scores.supply - b.scores.supply;
    else if (sortKey === 'sentiment') diff = a.scores.sentiment - b.scores.sentiment;
    else if (sortKey === 'changePercent') diff = a.changePercent - b.changePercent;
    return sortAsc ? diff : -diff;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => handleSort(k)}
        className={`flex items-center gap-1 text-xs font-medium transition-colors ${active ? 'text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
      >
        {label}
        {active && <span className="text-slate-400">{sortAsc ? '↑' : '↓'}</span>}
      </button>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-500">
        조건에 맞는 종목이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">종목</th>
            <th className="text-right px-3 py-3">
              <SortHeader label="등락률" k="changePercent" />
            </th>
            <th className="px-3 py-3 hidden lg:table-cell">
              <SortHeader label="기술(35%)" k="technical" />
            </th>
            <th className="px-3 py-3 hidden lg:table-cell">
              <SortHeader label="기본(20%)" k="fundamental" />
            </th>
            <th className="px-3 py-3 hidden md:table-cell">
              <SortHeader label="수급(30%)" k="supply" />
            </th>
            <th className="px-3 py-3 hidden lg:table-cell">
              <SortHeader label="센티(15%)" k="sentiment" />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="종합점수" k="composite" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">신호</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(stock => {
            const isExpanded = expanded === stock.ticker;
            const scoreColor =
              stock.scores.composite >= 70 ? 'text-green-400' :
              stock.scores.composite >= 50 ? 'text-yellow-400' :
              'text-red-400';

            return (
              <>
                <tr
                  key={stock.ticker}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : stock.ticker)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">{stock.name}</span>
                      <span className="text-xs text-slate-500">
                        {stock.ticker.replace('.KS', '').replace('.KQ', '')}
                        <span className={`ml-2 text-xs ${stock.market === 'KR' ? 'text-blue-400' : 'text-amber-400'}`}>
                          {stock.market === 'KR' ? '국내' : 'US'}
                        </span>
                        <span className="ml-1 text-slate-600">{stock.sector}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`font-mono text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell w-32">
                    <ScoreBar score={stock.scores.technical} color="technical" />
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell w-32">
                    <ScoreBar score={stock.scores.fundamental} color="fundamental" />
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell w-32">
                    <ScoreBar score={stock.scores.supply} color="supply" />
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell w-32">
                    <ScoreBar score={stock.scores.sentiment} color="sentiment" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold font-mono ${scoreColor}`}>
                        {stock.scores.composite}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SignalBadge signal={stock.signal} />
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${stock.ticker}-detail`} className="bg-slate-900/50 border-b border-slate-800/50">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <DetailCard title="📈 기술적 분석" color="blue">
                          <Item label="RSI(14)" value={stock.details.technical.rsi?.toFixed(1)} warn={stock.details.technical.rsi != null && stock.details.technical.rsi < 30} />
                          <Item label="MACD" value={stock.details.technical.macd?.toFixed(3)} />
                          <Item label="MA20" value={stock.details.technical.ma20?.toFixed(0)} />
                          <Item label="MA60" value={stock.details.technical.ma60?.toFixed(0)} />
                          <Item label="골든크로스" value={stock.details.technical.goldenCross === true ? '✅' : stock.details.technical.goldenCross === false ? '❌' : '-'} />
                          <Item label="거래량 비율" value={stock.details.technical.volumeRatio?.toFixed(2) + 'x'} />
                        </DetailCard>
                        <DetailCard title="🏦 기본적 분석" color="emerald">
                          <Item label="PER" value={stock.details.fundamental.pe?.toFixed(1)} />
                          <Item label="PBR" value={stock.details.fundamental.pb?.toFixed(2)} />
                          <Item label="ROE" value={stock.details.fundamental.roe != null ? (stock.details.fundamental.roe * 100).toFixed(1) + '%' : '-'} />
                          <Item label="매출성장률" value={stock.details.fundamental.revenueGrowth != null ? (stock.details.fundamental.revenueGrowth * 100).toFixed(1) + '%' : '-'} />
                          <Item label="부채비율" value={stock.details.fundamental.debtToEquity?.toFixed(2)} />
                        </DetailCard>
                        <DetailCard title="💰 수급 분석" color="violet">
                          <Item label="OBV 추세" value={stock.details.supply.obvTrend === 'up' ? '상승 ▲' : stock.details.supply.obvTrend === 'down' ? '하락 ▼' : '중립 —'} />
                          <Item label="상승거래량 비율" value={(stock.details.supply.upVolumeRatio * 100).toFixed(1) + '%'} />
                          <Item label="가격 포지션" value={(stock.details.supply.priceVolumeScore * 100).toFixed(1) + '%'} />
                        </DetailCard>
                        <DetailCard title="📊 점수 상세" color="amber">
                          <ScoreBreakdown scores={stock.scores} />
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400">종합점수</span>
                              <span className={`text-lg font-bold font-mono ${scoreColor}`}>{stock.scores.composite}</span>
                            </div>
                          </div>
                        </DetailCard>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const border: Record<string, string> = {
    blue: 'border-blue-500/20',
    emerald: 'border-emerald-500/20',
    violet: 'border-violet-500/20',
    amber: 'border-amber-500/20',
  };
  return (
    <div className={`rounded-lg p-4 bg-slate-800/60 border ${border[color] ?? 'border-slate-700/30'}`}>
      <h4 className="text-xs font-semibold text-slate-300 mb-3">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Item({ label, value, warn }: { label: string; value?: string | null; warn?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-medium ${warn ? 'text-green-400' : 'text-slate-300'}`}>
        {value ?? '-'}
      </span>
    </div>
  );
}
