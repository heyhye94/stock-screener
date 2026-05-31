import { NextRequest, NextResponse } from 'next/server';
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

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;

  const [ohlcv, fundamentals, sentiment] = await Promise.all([
    fetchOHLCV(ticker),
    fetchFundamentals(ticker),
    fetchSentiment(),
  ]);

  if (!ohlcv || ohlcv.closes.length === 0) {
    return NextResponse.json({ error: `No data for ${ticker}` }, { status: 404 });
  }

  const price = fundamentals?.price ?? ohlcv.closes[ohlcv.closes.length - 1];
  const change = fundamentals?.change ?? 0;
  const changePercent = fundamentals?.changePercent ?? 0;

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
  const sentiScore = scoreSentiment(sentiment);
  const composite = computeComposite({
    technical: techScore,
    fundamental: fundScore,
    supply: supplyScore,
    sentiment: sentiScore,
  });

  return NextResponse.json({
    ticker,
    price,
    change,
    changePercent,
    scores: {
      technical: techScore,
      fundamental: fundScore,
      supply: supplyScore,
      sentiment: sentiScore,
      composite,
    },
    signal: getSignal(composite),
    details: {
      technical: technicalDetails,
      fundamental: fundamentalDetails,
      supply: supplyDetails,
    },
    sentiment,
  });
}
