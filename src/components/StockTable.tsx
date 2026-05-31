'use client';
import { useState } from 'react';
import { StockResult, Signal } from '@/types';
import SignalBadge from './SignalBadge';
import ScoreBar from './ScoreBar';
import ScoreBreakdown from './ScoreBreakdown';

type SortKey = 'composite' | 'technical' | 'fundamental' | 'supply' | 'changePercent';

// 필터: 완전히 분리 (겹침 없음)
function matchFilter(s: StockResult, filter: string): boolean {
  if (filter === 'strong_buy') return s.signal === 'strong_buy';
  if (filter === 'watch')      return s.signal === 'watch';       // strong_buy 제외
  return true;
}

function formatPrice(price: number, market: 'KR' | 'US'): string {
  if (price <= 0) return '-';
  if (market === 'KR') {
    return price.toLocaleString('ko-KR') + '원';
  }
  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StockTable({
  stocks,
  filterSignal,
}: {
  stocks: StockResult[];
  filterSignal: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('composite');
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = stocks.filter(s => matchFilter(s, filterSignal));

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortKey === 'composite')   diff = a.scores.composite   - b.scores.composite;
    if (sortKey === 'technical')   diff = a.scores.technical   - b.scores.technical;
    if (sortKey === 'fundamental') diff = a.scores.fundamental - b.scores.fundamental;
    if (sortKey === 'supply')      diff = a.scores.supply      - b.scores.supply;
    if (sortKey === 'changePercent') diff = a.changePercent    - b.changePercent;
    return sortAsc ? diff : -diff;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => handleSort(k)}
        className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap transition-colors ${
          active ? 'text-slate-200' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        {label}{active && <span className="text-slate-400">{sortAsc ? '↑' : '↓'}</span>}
      </button>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500 text-sm">
        해당 조건의 종목이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60">
            <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">종목</th>
            <th className="text-right px-3 py-3"><SortTh label="현재가" k="composite" /></th>
            <th className="text-right px-3 py-3"><SortTh label="등락률" k="changePercent" /></th>
            <th className="px-3 py-3 hidden lg:table-cell"><SortTh label="기술(35%)" k="technical" /></th>
            <th className="px-3 py-3 hidden lg:table-cell"><SortTh label="기본(20%)" k="fundamental" /></th>
            <th className="px-3 py-3 hidden md:table-cell"><SortTh label="수급(30%)" k="supply" /></th>
            <th className="px-4 py-3"><SortTh label="종합점수" k="composite" /></th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">신호</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(stock => {
            const isExp = expanded === stock.ticker;
            const scoreColor =
              stock.scores.composite >= 65 ? 'text-green-400' :
              stock.scores.composite >= 48 ? 'text-yellow-400' :
              'text-red-400';
            const priceColor = stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400';

            return (
              <>
                <tr
                  key={stock.ticker}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isExp ? null : stock.ticker)}
                >
                  {/* 종목명 + 뉴스 */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 truncate">{stock.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          stock.market === 'KR'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {stock.market === 'KR' ? '국내' : 'US'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600">{stock.sector}</span>
                      {stock.news && (
                        <span className="text-xs text-slate-500 truncate max-w-[180px]" title={stock.news}>
                          📰 {stock.news}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 현재가 */}
                  <td className="px-3 py-3 text-right">
                    <span className="font-mono text-sm text-slate-200">
                      {formatPrice(stock.price, stock.market)}
                    </span>
                  </td>

                  {/* 등락률 */}
                  <td className="px-3 py-3 text-right">
                    <span className={`font-mono text-sm font-semibold ${priceColor}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* 기술적 */}
                  <td className="px-3 py-3 hidden lg:table-cell w-28">
                    <ScoreBar score={stock.scores.technical} color="technical" />
                  </td>

                  {/* 기본적 */}
                  <td className="px-3 py-3 hidden lg:table-cell w-28">
                    <ScoreBar score={stock.scores.fundamental} color="fundamental" />
                  </td>

                  {/* 수급 */}
                  <td className="px-3 py-3 hidden md:table-cell w-28">
                    <ScoreBar score={stock.scores.supply} color="supply" />
                  </td>

                  {/* 종합점수 */}
                  <td className="px-4 py-3">
                    <span className={`text-2xl font-bold font-mono ${scoreColor}`}>
                      {stock.scores.composite}
                    </span>
                  </td>

                  {/* 신호 */}
                  <td className="px-4 py-3">
                    <SignalBadge signal={stock.signal} />
                  </td>
                </tr>

                {/* 상세 확장 */}
                {isExp && (
                  <tr key={`${stock.ticker}-detail`} className="bg-slate-900/60 border-b border-slate-800/50">
                    <td colSpan={8} className="px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        {/* 기술적 분석 */}
                        <DetailCard title="📈 기술적 분석" accent="blue">
                          <Item label="RSI (14)" value={stock.details.technical.rsi?.toFixed(1)}
                            tag={stock.details.technical.rsi != null && stock.details.technical.rsi < 30 ? '과매도' :
                                 stock.details.technical.rsi != null && stock.details.technical.rsi < 45 ? '저점 회복' : undefined} />
                          <Item label="MACD" value={stock.details.technical.macd?.toFixed(3)} />
                          <Item label="Signal" value={stock.details.technical.macdSignal?.toFixed(3)} />
                          <Item label="MA 20" value={stock.details.technical.ma20 != null ? formatPrice(stock.details.technical.ma20, stock.market) : undefined} />
                          <Item label="MA 60" value={stock.details.technical.ma60 != null ? formatPrice(stock.details.technical.ma60, stock.market) : undefined} />
                          <Item label="골든크로스" value={
                            stock.details.technical.goldenCross === true  ? '✅ 골든크로스' :
                            stock.details.technical.goldenCross === false ? '❌ 데드크로스' : '-'
                          } />
                          <Item label="BB 하단" value={stock.details.technical.bbLower != null ? formatPrice(stock.details.technical.bbLower, stock.market) : undefined} />
                          <Item label="거래량 비율" value={stock.details.technical.volumeRatio?.toFixed(2) + 'x'} />
                        </DetailCard>

                        {/* 기본적 분석 */}
                        <DetailCard title="🏦 기본적 분석" accent="emerald">
                          <Item label="PER" value={stock.details.fundamental.pe?.toFixed(1)} />
                          <Item label="PBR" value={stock.details.fundamental.pb?.toFixed(2)} />
                          <Item label="ROE" value={
                            stock.details.fundamental.roe != null
                              ? (stock.details.fundamental.roe * 100).toFixed(1) + '%' : '-'
                          } />
                          <Item label="매출 성장률" value={
                            stock.details.fundamental.revenueGrowth != null
                              ? (stock.details.fundamental.revenueGrowth * 100).toFixed(1) + '%' : '-'
                          } />
                          <Item label="부채비율 (D/E)" value={stock.details.fundamental.debtToEquity?.toFixed(2)} />
                          <div className="mt-2 pt-2 border-t border-slate-700/40">
                            <p className="text-xs text-slate-600">* ROE·성장률·부채비율은 추후 업데이트 예정</p>
                          </div>
                        </DetailCard>

                        {/* 수급 분석 */}
                        <DetailCard title="💰 수급 분석" accent="violet">
                          <Item label="OBV 추세" value={
                            stock.details.supply.obvTrend === 'up'   ? '▲ 상승 (매집)' :
                            stock.details.supply.obvTrend === 'down' ? '▼ 하락 (분산)' : '— 중립'
                          } />
                          <Item label="상승 거래량 비율" value={(stock.details.supply.upVolumeRatio * 100).toFixed(1) + '%'} />
                          <Item label="가격 포지션 (20일)" value={(stock.details.supply.priceVolumeScore * 100).toFixed(0) + '%'} />
                          <div className="mt-2 pt-2 border-t border-slate-700/40 text-xs text-slate-600">
                            * OBV · 거래량 기반 프록시
                          </div>
                        </DetailCard>

                        {/* 종합 점수 + 최신 이슈 */}
                        <DetailCard title="📊 점수 요약" accent="amber">
                          <ScoreBreakdown scores={stock.scores} />
                          <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                            <span className="text-xs text-slate-400">종합</span>
                            <span className={`text-2xl font-bold font-mono ${scoreColor}`}>
                              {stock.scores.composite}
                            </span>
                          </div>
                          {stock.news && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <p className="text-xs text-slate-500 font-medium mb-1">📰 최신 이슈</p>
                              <p className="text-xs text-slate-300 leading-relaxed">{stock.news}</p>
                            </div>
                          )}
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

function DetailCard({
  title, accent, children,
}: {
  title: string; accent: string; children: React.ReactNode;
}) {
  const border: Record<string, string> = {
    blue: 'border-blue-500/20', emerald: 'border-emerald-500/20',
    violet: 'border-violet-500/20', amber: 'border-amber-500/20',
  };
  return (
    <div className={`rounded-xl p-4 bg-slate-800/70 border ${border[accent] ?? 'border-slate-700/30'}`}>
      <h4 className="text-xs font-semibold text-slate-300 mb-3">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Item({
  label, value, tag,
}: {
  label: string; value?: string | null; tag?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {tag && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">{tag}</span>
        )}
        <span className="text-xs font-mono font-medium text-slate-300 text-right">{value ?? '-'}</span>
      </div>
    </div>
  );
}
