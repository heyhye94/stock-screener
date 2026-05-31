'use client';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { ScreenResponse } from '@/types';
import StockTable from '@/components/StockTable';
import SentimentPanel from '@/components/SentimentPanel';

type MarketFilter = 'all' | 'kr' | 'us';
type SignalFilter = 'all' | 'strong_buy' | 'watch';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const MARKET_LABELS: Record<MarketFilter, string> = { all: '전체', kr: '국내', us: '미국' };
const SIGNAL_LABELS: Record<SignalFilter, string> = { all: '전체', strong_buy: '70+ 강한 매수', watch: '50+ 관망 포함' };

export default function Home() {
  const [market, setMarket] = useState<MarketFilter>('all');
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');
  const [manualRefresh, setManualRefresh] = useState(0);

  const { data, error, isLoading, mutate } = useSWR<ScreenResponse>(
    `/api/screen?market=${market}&r=${manualRefresh}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  );

  const handleRefresh = useCallback(() => {
    setManualRefresh(n => n + 1);
    mutate();
  }, [mutate]);

  const updatedAgo = data?.updatedAt
    ? formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true, locale: ko })
    : null;

  const strongBuyCount = data?.stocks.filter(s => s.signal === 'strong_buy').length ?? 0;
  const watchCount = data?.stocks.filter(s => s.signal === 'watch').length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-slate-100">매수 종목 스크리너</h1>
            <p className="text-xs text-slate-500 mt-0.5">기술적 35% · 기본적 20% · 수급 30% · 센티먼트 15%</p>
          </div>
          <div className="flex items-center gap-3">
            {updatedAgo && (
              <span className="text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1.5 live-dot" />
                {updatedAgo} 업데이트
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로딩 중...' : '↻ 새로고침'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        {/* Sentiment */}
        {data?.sentiment && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">시장 센티먼트</h2>
            <SentimentPanel sentiment={data.sentiment} />
          </div>
        )}

        {/* Stats */}
        {data && (
          <div className="space-y-2">
            {data.scannedCount && (
              <p className="text-xs text-slate-500">
                🔍 총 <span className="text-slate-300 font-semibold">{data.scannedCount}개</span> 종목 스캔 →
                점수 상위 <span className="text-slate-300 font-semibold">{data.stocks.length}개</span> 표시
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="표시 종목" value={data.stocks.length} color="text-slate-200" />
              <StatCard label="강한 매수 (65+)" value={strongBuyCount} color="text-green-400" />
              <StatCard label="관망 (48~64)" value={watchCount} color="text-yellow-400" />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(Object.keys(MARKET_LABELS) as MarketFilter[]).map(m => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  market === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {MARKET_LABELS[m]}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(Object.keys(SIGNAL_LABELS) as SignalFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setSignalFilter(s)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  signalFilter === s
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {SIGNAL_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Signal Legend */}
        <div className="card p-3 flex flex-wrap gap-4">
          <LegendItem color="bg-green-500" label="65점↑ 강한 매수 신호" />
          <LegendItem color="bg-yellow-500" label="48~64점 관망 / 분할매수" />
          <LegendItem color="bg-red-500" label="48점↓ 신호 없음" />
          <span className="text-xs text-slate-600 ml-auto self-center hidden sm:block">종목 클릭 시 상세 분석 펼쳐보기</span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading && !data && (
            <div className="p-12 text-center space-y-3">
              <div className="text-2xl">📊</div>
              <p className="text-slate-400 text-sm">데이터를 불러오는 중...</p>
              <p className="text-slate-600 text-xs">Yahoo Finance에서 {market === 'all' ? '30개' : '15개'} 종목을 분석합니다 (약 10~20초)</p>
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-red-400 text-sm">
              데이터 로드 실패. 새로고침을 눌러주세요.
            </div>
          )}
          {data && (
            <StockTable stocks={data.stocks} filterSignal={signalFilter} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-xs text-slate-600 text-center pb-4 space-y-1">
          <p>데이터 출처: Yahoo Finance (기술·기본), CNN Fear &amp; Greed (센티먼트)</p>
          <p>본 정보는 투자 참고용이며 투자 판단의 책임은 투자자 본인에게 있습니다.</p>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-4 text-center">
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
