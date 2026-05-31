import { NextRequest, NextResponse } from 'next/server';
import { ALL_STOCKS, KOREAN_STOCKS, US_STOCKS } from '@/lib/stocks';
import { fetchOHLCV, fetchFundamentals } from '@/lib/yahoo';
import { computeTechnical, computeSupply } from '@/lib/indicators';
import { fetchSentiment } from '@/lib/sentiment';
import {
  scoreTechnical,
  scoreFundamental,
  scoreSupply,
  scoreSentiment,
  computeComposite,
  getSignal,
} from '@/lib/scoring';
import { StockResult, ScreenResponse } from '@/types';

export const runtime = 'nodejs';

const TOP_N = 30; // 최종 표시 종목 수

type StockMeta = { ticker: string; name: string; market: 'KR' | 'US'; sector: string };

// Phase 1: OHLCV만으로 기술+수급 점수 계산 (빠른 선별)
async function quickScore(meta: StockMeta, sentiScore: number) {
  const ohlcv = await fetchOHLCV(meta.ticker);
  if (!ohlcv || ohlcv.closes.length < 30) return null;

  const price = ohlcv.closes[ohlcv.closes.length - 1];
  const technicalDetails = computeTechnical(ohlcv);
  const supplyDetails = computeSupply(ohlcv);

  const techScore = scoreTechnical(technicalDetails, price);
  const supplyScore = scoreSupply(supplyDetails);

  // 빠른 예비 점수 (기본적 제외): 기술45% + 수급40% + 센티15%
  const preScore = Math.round(techScore * 0.45 + supplyScore * 0.40 + sentiScore * 0.15);

  return { meta, ohlcv, price, technicalDetails, supplyDetails, techScore, supplyScore, preScore };
}

// Phase 2: 상위 후보에만 기본적 분석 추가
async function fullAnalysis(
  candidate: NonNullable<Awaited<ReturnType<typeof quickScore>>>,
  sentiScore: number
): Promise<StockResult> {
  const { meta, ohlcv, price, technicalDetails, supplyDetails, techScore, supplyScore } = candidate;

  const fundamentals = await fetchFundamentals(meta.ticker);
  const fundamentalDetails = {
    pe: fundamentals?.pe ?? null,
    pb: fundamentals?.pb ?? null,
    roe: fundamentals?.roe ?? null,
    revenueGrowth: fundamentals?.revenueGrowth ?? null,
    debtToEquity: fundamentals?.debtToEquity ?? null,
  };

  const fundScore = scoreFundamental(fundamentalDetails);
  const composite = computeComposite({
    technical: techScore,
    fundamental: fundScore,
    supply: supplyScore,
    sentiment: sentiScore,
  });

  const lastClose = ohlcv.closes[ohlcv.closes.length - 1];
  const prevClose = ohlcv.closes[ohlcv.closes.length - 2] ?? lastClose;
  const actualPrice = fundamentals?.price ?? lastClose;
  const change = fundamentals?.change ?? (actualPrice - prevClose);
  const changePercent = fundamentals?.changePercent ?? ((change / prevClose) * 100);

  return {
    ...meta,
    price: actualPrice,
    change,
    changePercent,
    scores: { technical: techScore, fundamental: fundScore, supply: supplyScore, sentiment: sentiScore, composite },
    signal: getSignal(composite),
    details: { technical: technicalDetails, fundamental: fundamentalDetails, supply: supplyDetails },
  };
}

// 배치 처리 헬퍼
async function runBatch<T, R>(items: T[], fn: (item: T) => Promise<R>, batchSize = 15): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get('market') ?? 'all';

  const universe =
    market === 'kr' ? KOREAN_STOCKS :
    market === 'us' ? US_STOCKS :
    ALL_STOCKS;

  const sentiment = await fetchSentiment();
  const sentiScore = scoreSentiment(sentiment);

  // Phase 1: 전체 유니버스 OHLCV 기반 빠른 채점
  const phase1 = await runBatch(universe, meta => quickScore(meta, sentiScore), 20);
  const validCandidates = phase1.filter(Boolean) as NonNullable<typeof phase1[0]>[];

  // Phase 1 점수 기준 상위 후보 선별
  const TOP_CANDIDATES = 50;
  validCandidates.sort((a, b) => b.preScore - a.preScore);
  const topCandidates = validCandidates.slice(0, TOP_CANDIDATES);

  // Phase 2: 상위 후보에만 기본적 분석 추가
  const fullResults = await runBatch(
    topCandidates,
    candidate => fullAnalysis(candidate, sentiScore),
    10
  );

  // 최종 정렬 후 TOP_N 반환
  fullResults.sort((a, b) => b.scores.composite - a.scores.composite);
  const topResults = fullResults.slice(0, TOP_N);

  const response: ScreenResponse & { scannedCount: number; candidateCount: number } = {
    stocks: topResults,
    sentiment,
    updatedAt: new Date().toISOString(),
    scannedCount: validCandidates.length,
    candidateCount: topCandidates.length,
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  });
}
