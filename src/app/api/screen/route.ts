import { NextRequest, NextResponse } from 'next/server';
import { ALL_STOCKS, KOREAN_STOCKS, US_STOCKS } from '@/lib/stocks';
import { fetchOHLCV, fetchFundamentals, fetchNewsHeadline } from '@/lib/yahoo';
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

type StockMeta = typeof ALL_STOCKS[0];

async function analyzeStock(
  meta: StockMeta,
  sentiScore: number
): Promise<StockResult | null> {
  // OHLCV + 기본적 + 뉴스 병렬 fetching
  const [ohlcv, fundamentals, headline] = await Promise.all([
    fetchOHLCV(meta.ticker),
    fetchFundamentals(meta.ticker),
    fetchNewsHeadline(meta.ticker),
  ]);

  if (!ohlcv || ohlcv.closes.length < 30) return null;

  // 가격/등락 계산 (우선순위: v7/quote > 차트 메타)
  const price = fundamentals?.price || ohlcv.metaPrice || ohlcv.closes[ohlcv.closes.length - 1];
  const prevClose = ohlcv.metaPrevClose ?? ohlcv.closes[ohlcv.closes.length - 2] ?? price;
  const change = fundamentals?.change ?? (price - prevClose);
  const changePercent = fundamentals?.changePercent ?? (prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0);

  const technicalDetails = computeTechnical(ohlcv);
  const supplyDetails    = computeSupply(ohlcv);
  const fundamentalDetails = {
    pe: fundamentals?.pe ?? null,
    pb: fundamentals?.pb ?? null,
    roe: fundamentals?.roe ?? null,
    revenueGrowth: fundamentals?.revenueGrowth ?? null,
    debtToEquity: fundamentals?.debtToEquity ?? null,
  };

  const techScore   = scoreTechnical(technicalDetails, price);
  const fundScore   = scoreFundamental(fundamentalDetails);
  const supplyScore = scoreSupply(supplyDetails);
  const composite   = computeComposite({
    technical: techScore, fundamental: fundScore,
    supply: supplyScore, sentiment: sentiScore,
  });

  return {
    ...meta,
    price,
    change,
    changePercent,
    scores: { technical: techScore, fundamental: fundScore, supply: supplyScore, sentiment: sentiScore, composite },
    signal: getSignal(composite),
    details: { technical: technicalDetails, fundamental: fundamentalDetails, supply: supplyDetails },
    news: headline,
  };
}

async function runBatch<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  size = 10
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = await Promise.all(items.slice(i, i + size).map(fn));
    out.push(...batch);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get('market') ?? 'all';

  const universe =
    market === 'kr' ? KOREAN_STOCKS :
    market === 'us' ? US_STOCKS :
    ALL_STOCKS;

  const sentiment   = await fetchSentiment();
  const sentiScore  = scoreSentiment(sentiment);

  const rawResults  = await runBatch(universe, meta => analyzeStock(meta, sentiScore), 10);
  const results     = (rawResults.filter(Boolean) as StockResult[])
    .sort((a, b) => b.scores.composite - a.scores.composite)
    .slice(0, 30);

  const response: ScreenResponse = {
    stocks: results,
    sentiment,
    updatedAt: new Date().toISOString(),
    scannedCount: rawResults.filter(Boolean).length,
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  });
}
