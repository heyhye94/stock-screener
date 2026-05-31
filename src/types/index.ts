export type Market = 'KR' | 'US';
export type Signal = 'strong_buy' | 'watch' | 'no_signal';

export interface StockMeta {
  ticker: string;
  name: string;
  market: Market;
  sector: string;
}

export interface TechnicalDetails {
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  ma5: number | null;
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
  bbUpper: number | null;
  bbMiddle: number | null;
  bbLower: number | null;
  volumeRatio: number | null;
  goldenCross: boolean | null;
}

export interface FundamentalDetails {
  pe: number | null;
  pb: number | null;
  roe: number | null;
  revenueGrowth: number | null;
  debtToEquity: number | null;
}

export interface SupplyDetails {
  obvTrend: 'up' | 'down' | 'neutral';
  upVolumeRatio: number;
  priceVolumeScore: number;
}

export interface ScoreBreakdown {
  technical: number;
  fundamental: number;
  supply: number;
  sentiment: number;
  composite: number;
}

export interface StockResult {
  ticker: string;
  name: string;
  market: Market;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  scores: ScoreBreakdown;
  signal: Signal;
  details: {
    technical: TechnicalDetails;
    fundamental: FundamentalDetails;
    supply: SupplyDetails;
  };
  error?: string;
}

export interface SentimentData {
  fearGreed: number;
  fearGreedLabel: string;
  vix: number | null;
  updatedAt: string;
}

export interface ScreenResponse {
  stocks: StockResult[];
  sentiment: SentimentData;
  updatedAt: string;
}
