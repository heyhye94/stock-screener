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

async function analyzeStock(
  meta: { ticker: string; name: string; market: 'KR' | 'US'; sector: string },
  sentimentScore: number
): Promise<StockResult> {
  const [ohlcv, fundamentals] = await Promise.all([
    fetchOHLCV(meta.ticker),
    fetchFundamentals(meta.ticker),
  ]);

  if (!ohlcv || ohlcv.closes.length < 30) {
    return {
      ...meta,
      price: 0,
      change: 0,
      changePercent: 0,
      scores: { technical: 50, fundamental: 50, supply: 50, sentiment: sentimentScore, composite: 50 },
      signal: 'no_signal',
      details: {
        technical: { rsi: null, macd: null, macdSignal: null, ma5: null, ma20: null, ma60: null, ma120: null, bbUpper: null, bbMiddle: null, bbLower: null, volumeRatio: null, goldenCross: null },
        fundamental: { pe: null, pb: null, roe: null, revenueGrowth: null, debtToEquity: null },
        supply: { obvTrend: 'neutral', upVolumeRatio: 0.5, priceVolumeScore: 0.5 },
      },
      error: 'Insufficient data',
    };
  }

  const price = fundamentals?.price ?? ohlcv.closes[ohlcv.closes.length - 1];
  const technicalDetails = computeTechnical(ohlcv);
  const supplyDetails = computeSupply(ohlcv);
  const fundamentalDetails = {
    pe: fundamentals?.pe ?? null,
    pb: fundamentals?.pb ?? null,
    roe: fundamentals?.roe ?? null,
    revenueGrowth: fundamentals?.revenueGrowth ?? null,
    debtToEquity: fundamentals?.debtToEquity ?? null,
  };

  const techScore = scoreTechnical(technicalDetails, price);
  const fundScore = scoreFundamental(fundamentalDetails);
  const supplyScore = scoreSupply(supplyDetails);
  const composite = computeComposite({ technical: techScore, fundamental: fundScore, supply: supplyScore, sentiment: sentimentScore });

  return {
    ...meta,
    price,
    change: fundamentals?.change ?? 0,
    changePercent: fundamentals?.changePercent ?? 0,
    scores: { technical: techScore, fundamental: fundScore, supply: supplyScore, sentiment: sentimentScore, composite },
    signal: getSignal(composite),
    details: { technical: technicalDetails, fundamental: fundamentalDetails, supply: supplyDetails },
  };
}

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get('market') ?? 'all';

  const stockList =
    market === 'kr' ? KOREAN_STOCKS :
    market === 'us' ? US_STOCKS :
    ALL_STOCKS;

  const sentiment = await fetchSentiment();
  const sentiScore = scoreSentiment(sentiment);

  // Analyze in batches of 10 to avoid timeout
  const BATCH = 10;
  const results: StockResult[] = [];
  for (let i = 0; i < stockList.length; i += BATCH) {
    const batch = stockList.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(s => analyzeStock(s, sentiScore)));
    results.push(...batchResults);
  }

  results.sort((a, b) => b.scores.composite - a.scores.composite);

  const response: ScreenResponse = {
    stocks: results,
    sentiment,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  });
}
