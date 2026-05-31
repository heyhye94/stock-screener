import { OHLCVData } from './yahoo';
import { TechnicalDetails, SupplyDetails } from '@/types';

function ema(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export function calcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  const slice = closes.slice(-(period + 20));
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = slice[i] - slice[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = period + 1; i < slice.length; i++) {
    const diff = slice[i] - slice[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

export function calcMACD(closes: number[]): { macd: number; signal: number } | null {
  if (closes.length < 35) return null;
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = ema(macdLine.slice(-26), 9);
  return {
    macd: macdLine[macdLine.length - 1],
    signal: signalLine[signalLine.length - 1],
  };
}

export function calcBB(closes: number[], period = 20): { upper: number; middle: number; lower: number } | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  return { upper: mean + 2 * std, middle: mean, lower: mean - 2 * std };
}

export function calcMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function calcVolumeRatio(volumes: number[]): number | null {
  if (volumes.length < 21) return null;
  const avg = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
  return avg > 0 ? volumes[volumes.length - 1] / avg : null;
}

export function calcOBVTrend(closes: number[], volumes: number[]): 'up' | 'down' | 'neutral' {
  if (closes.length < 10) return 'neutral';
  let obv = 0;
  const obvSeries: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i];
    else if (closes[i] < closes[i - 1]) obv -= volumes[i];
    obvSeries.push(obv);
  }
  const recent = obvSeries.slice(-10);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const pct = first !== 0 ? (last - first) / Math.abs(first) : 0;
  if (pct > 0.02) return 'up';
  if (pct < -0.02) return 'down';
  return 'neutral';
}

export function calcUpVolumeRatio(closes: number[], volumes: number[]): number {
  if (closes.length < 20) return 0.5;
  const slice20 = closes.slice(-20);
  const vol20 = volumes.slice(-20);
  let upVol = 0;
  let downVol = 0;
  for (let i = 1; i < slice20.length; i++) {
    if (slice20[i] >= slice20[i - 1]) upVol += vol20[i];
    else downVol += vol20[i];
  }
  const total = upVol + downVol;
  return total > 0 ? upVol / total : 0.5;
}

export function computeTechnical(ohlcv: OHLCVData): TechnicalDetails {
  const { closes, volumes } = ohlcv;
  const rsi = calcRSI(closes);
  const macdResult = calcMACD(closes);
  const bb = calcBB(closes);
  const ma5 = calcMA(closes, 5);
  const ma20 = calcMA(closes, 20);
  const ma60 = calcMA(closes, 60);
  const ma120 = calcMA(closes, 120);
  const volumeRatio = calcVolumeRatio(volumes);
  const goldenCross = ma20 != null && ma60 != null ? ma20 > ma60 : null;

  return {
    rsi,
    macd: macdResult?.macd ?? null,
    macdSignal: macdResult?.signal ?? null,
    ma5,
    ma20,
    ma60,
    ma120,
    bbUpper: bb?.upper ?? null,
    bbMiddle: bb?.middle ?? null,
    bbLower: bb?.lower ?? null,
    volumeRatio,
    goldenCross,
  };
}

export function computeSupply(ohlcv: OHLCVData): SupplyDetails {
  const { closes, volumes } = ohlcv;
  const obvTrend = calcOBVTrend(closes, volumes);
  const upVolumeRatio = calcUpVolumeRatio(closes, volumes);

  const lastClose = closes[closes.length - 1];
  const lastHigh = Math.max(...closes.slice(-20));
  const lastLow = Math.min(...closes.slice(-20));
  const range = lastHigh - lastLow;
  const priceVolumeScore = range > 0 ? (lastClose - lastLow) / range : 0.5;

  return { obvTrend, upVolumeRatio, priceVolumeScore };
}
