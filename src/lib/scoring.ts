import { TechnicalDetails, FundamentalDetails, SupplyDetails, ScoreBreakdown, Signal } from '@/types';
import { SentimentData } from './sentiment';

export function scoreTechnical(t: TechnicalDetails, price: number): number {
  let score = 0;
  let maxScore = 0;

  // RSI (20pts) — oversold = buying opportunity
  if (t.rsi != null) {
    maxScore += 20;
    if (t.rsi < 30) score += 20;
    else if (t.rsi < 40) score += 15;
    else if (t.rsi < 50) score += 10;
    else if (t.rsi < 60) score += 5;
  }

  // MACD (20pts)
  if (t.macd != null && t.macdSignal != null) {
    maxScore += 20;
    if (t.macd > t.macdSignal) score += 20;
    else if (t.macd > t.macdSignal * 0.98) score += 10;
  }

  // Price vs MA20 (10pts)
  if (t.ma20 != null && price > 0) {
    maxScore += 10;
    if (price > t.ma20) score += 10;
    else if (price > t.ma20 * 0.97) score += 5;
  }

  // Price vs MA60 (10pts)
  if (t.ma60 != null && price > 0) {
    maxScore += 10;
    if (price > t.ma60) score += 10;
    else if (price > t.ma60 * 0.97) score += 5;
  }

  // Golden/Dead Cross (15pts)
  if (t.goldenCross != null) {
    maxScore += 15;
    if (t.goldenCross) score += 15;
  }

  // Bollinger Bands position (15pts) — near lower band = buy
  if (t.bbUpper != null && t.bbLower != null && t.bbMiddle != null && price > 0) {
    maxScore += 15;
    const range = t.bbUpper - t.bbLower;
    if (range > 0) {
      const pos = (price - t.bbLower) / range; // 0 = at lower, 1 = at upper
      if (pos < 0.1) score += 15;
      else if (pos < 0.25) score += 12;
      else if (pos < 0.4) score += 8;
      else if (pos < 0.5) score += 4;
    }
  }

  // Volume surge (10pts)
  if (t.volumeRatio != null) {
    maxScore += 10;
    if (t.volumeRatio > 1.5) score += 10;
    else if (t.volumeRatio > 1.2) score += 7;
    else if (t.volumeRatio > 0.8) score += 3;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

export function scoreFundamental(f: FundamentalDetails): number {
  let score = 0;
  let maxScore = 0;

  // P/E ratio (30pts)
  if (f.pe != null && f.pe > 0) {
    maxScore += 30;
    if (f.pe < 10) score += 30;
    else if (f.pe < 15) score += 25;
    else if (f.pe < 20) score += 20;
    else if (f.pe < 30) score += 12;
    else if (f.pe < 50) score += 5;
  }

  // P/B ratio (20pts)
  if (f.pb != null && f.pb > 0) {
    maxScore += 20;
    if (f.pb < 1) score += 20;
    else if (f.pb < 2) score += 15;
    else if (f.pb < 3) score += 10;
    else if (f.pb < 5) score += 5;
  }

  // ROE (20pts)
  if (f.roe != null) {
    maxScore += 20;
    const roePct = f.roe * 100;
    if (roePct > 25) score += 20;
    else if (roePct > 15) score += 15;
    else if (roePct > 10) score += 10;
    else if (roePct > 5) score += 5;
  }

  // Revenue Growth (20pts)
  if (f.revenueGrowth != null) {
    maxScore += 20;
    const growthPct = f.revenueGrowth * 100;
    if (growthPct > 20) score += 20;
    else if (growthPct > 10) score += 15;
    else if (growthPct > 5) score += 10;
    else if (growthPct > 0) score += 5;
  }

  // Debt/Equity (10pts)
  if (f.debtToEquity != null) {
    maxScore += 10;
    if (f.debtToEquity < 0.5) score += 10;
    else if (f.debtToEquity < 1) score += 7;
    else if (f.debtToEquity < 2) score += 4;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

export function scoreSupply(s: SupplyDetails): number {
  let score = 0;

  // OBV Trend (40pts)
  if (s.obvTrend === 'up') score += 40;
  else if (s.obvTrend === 'neutral') score += 20;

  // Up Volume Ratio (35pts)
  score += Math.round(s.upVolumeRatio * 35);

  // Price in range position (25pts) — lower half means potential reversal opportunity
  // For buy signal: price near lows with volume = accumulation
  const rangeScore = s.priceVolumeScore < 0.4
    ? Math.round((1 - s.priceVolumeScore) * 25)
    : Math.round(s.priceVolumeScore * 25);
  score += Math.min(rangeScore, 25);

  return Math.min(Math.round(score), 100);
}

export function scoreSentiment(sentiment: SentimentData): number {
  let score = 0;

  // Fear & Greed (contrarian: fear = buy signal) (70pts)
  const fg = sentiment.fearGreed;
  if (fg <= 25) score += 70; // Extreme Fear
  else if (fg <= 40) score += 55; // Fear
  else if (fg <= 55) score += 40; // Neutral
  else if (fg <= 70) score += 25; // Greed
  else score += 10; // Extreme Greed

  // VIX (30pts) — high VIX = fear = potential buying opportunity
  if (sentiment.vix != null) {
    if (sentiment.vix > 30) score += 30;
    else if (sentiment.vix > 25) score += 22;
    else if (sentiment.vix > 20) score += 15;
    else if (sentiment.vix > 15) score += 8;
    else score += 3;
  } else {
    score += 15; // neutral default
  }

  return Math.min(Math.round(score), 100);
}

export function computeComposite(scores: Omit<ScoreBreakdown, 'composite'>): number {
  return Math.round(
    scores.technical * 0.35 +
    scores.fundamental * 0.20 +
    scores.supply * 0.30 +
    scores.sentiment * 0.15
  );
}

export function getSignal(composite: number): Signal {
  if (composite >= 70) return 'strong_buy';
  if (composite >= 50) return 'watch';
  return 'no_signal';
}
