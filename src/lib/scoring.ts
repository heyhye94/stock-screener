import { TechnicalDetails, FundamentalDetails, SupplyDetails, ScoreBreakdown, Signal } from '@/types';
import { SentimentData } from './sentiment';

/**
 * 기술적 분석 점수 (0-100)
 * 핵심 문제 수정:
 * - RSI 45-65 (정상 상승추세)도 충분히 점수 반영
 * - 볼린저 하단뿐 아니라 상단 돌파(모멘텀 매수)도 점수 부여
 * - 골든크로스+MA20 이상 = 핵심 매수 신호로 상향
 */
export function scoreTechnical(t: TechnicalDetails, price: number): number {
  let score = 0;
  let maxScore = 0;

  // RSI (20pts) — 과매도 회복 구간이 가장 강한 신호, 상승추세도 인정
  if (t.rsi != null) {
    maxScore += 20;
    if (t.rsi >= 30 && t.rsi < 45) score += 20;  // 과매도에서 회복 중 = 최강 매수
    else if (t.rsi < 30) score += 15;              // 과매도 (하락 지속 리스크)
    else if (t.rsi >= 45 && t.rsi < 60) score += 13; // 건강한 모멘텀
    else if (t.rsi >= 60 && t.rsi < 70) score += 8;  // 강세 (과매수 주의)
    else score += 3;                                   // RSI > 70 또는 < 20
  }

  // MACD (20pts) — 골든크로스 > 유지 > 데드크로스
  if (t.macd != null && t.macdSignal != null) {
    maxScore += 20;
    const diff = t.macd - t.macdSignal;
    const diffPct = Math.abs(t.macdSignal) > 0 ? diff / Math.abs(t.macdSignal) : 0;
    if (diffPct > 0.05) score += 20;         // 강한 상승 크로스
    else if (diff > 0) score += 15;           // 소폭 상회
    else if (diffPct > -0.03) score += 8;     // 크로스 직전
    // else 0
  }

  // MA 구조 (20pts) — 골든크로스 + 가격 위치
  if (t.ma20 != null && t.ma60 != null && price > 0) {
    maxScore += 20;
    const aboveMA20 = price >= t.ma20;
    const goldenCross = t.ma20 > t.ma60;
    if (aboveMA20 && goldenCross) score += 20;       // 이상적 구조
    else if (aboveMA20 && !goldenCross) score += 12; // 단기 반등
    else if (!aboveMA20 && goldenCross) score += 10; // 눌림목 매수 기회
    else score += 2;                                   // 데드크로스 + 아래
  }

  // 볼린저밴드 (20pts) — 하단 매수 + 상단 돌파 모멘텀 둘 다 반영
  if (t.bbUpper != null && t.bbLower != null && price > 0) {
    maxScore += 20;
    const range = t.bbUpper - t.bbLower;
    if (range > 0) {
      const pos = (price - t.bbLower) / range; // 0=하단, 1=상단
      if (pos < 0) score += 20;        // 밴드 하단 이탈 (강한 매수)
      else if (pos < 0.15) score += 18;
      else if (pos < 0.35) score += 14;
      else if (pos < 0.5) score += 9;
      else if (pos < 0.75) score += 5;
      else if (pos > 1.0) score += 16; // 상단 돌파 (모멘텀 매수)
      else score += 2;
    }
  }

  // 거래량 (20pts) — 거래량 동반 = 신뢰도 상승
  if (t.volumeRatio != null) {
    maxScore += 20;
    if (t.volumeRatio > 2.0) score += 20;
    else if (t.volumeRatio > 1.5) score += 16;
    else if (t.volumeRatio > 1.2) score += 11;
    else if (t.volumeRatio > 0.8) score += 5;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

/**
 * 기본적 분석 점수 (0-100)
 * 데이터 없는 항목은 제외(중립)하고 있는 데이터만으로 비율 계산
 */
export function scoreFundamental(f: FundamentalDetails): number {
  let score = 0;
  let maxScore = 0;

  // PER (30pts) — 저PER 선호, 성장주는 고PER도 감안
  if (f.pe != null && f.pe > 0 && f.pe < 500) {
    maxScore += 30;
    if (f.pe < 10) score += 30;
    else if (f.pe < 15) score += 26;
    else if (f.pe < 20) score += 22;
    else if (f.pe < 30) score += 16;
    else if (f.pe < 50) score += 8;
    else score += 2;
  }

  // PBR (20pts)
  if (f.pb != null && f.pb > 0) {
    maxScore += 20;
    if (f.pb < 1) score += 20;
    else if (f.pb < 2) score += 16;
    else if (f.pb < 4) score += 10;
    else if (f.pb < 8) score += 5;
  }

  // ROE (20pts)
  if (f.roe != null) {
    maxScore += 20;
    const r = f.roe * 100;
    if (r > 25) score += 20;
    else if (r > 15) score += 16;
    else if (r > 10) score += 11;
    else if (r > 5) score += 6;
    else if (r > 0) score += 2;
  }

  // 매출성장률 (20pts)
  if (f.revenueGrowth != null) {
    maxScore += 20;
    const g = f.revenueGrowth * 100;
    if (g > 25) score += 20;
    else if (g > 15) score += 16;
    else if (g > 8) score += 12;
    else if (g > 3) score += 7;
    else if (g > 0) score += 3;
  }

  // 부채비율 (10pts) — 낮을수록 좋음
  if (f.debtToEquity != null && f.debtToEquity >= 0) {
    maxScore += 10;
    if (f.debtToEquity < 0.3) score += 10;
    else if (f.debtToEquity < 0.7) score += 8;
    else if (f.debtToEquity < 1.5) score += 5;
    else if (f.debtToEquity < 3) score += 2;
  }

  // 데이터가 거의 없으면 중립 50 반환
  if (maxScore < 20) return 50;
  return Math.round((score / maxScore) * 100);
}

/**
 * 수급 분석 점수 (0-100)
 * 핵심 수정: upVolumeRatio * 35 → 평균(0.5) 대비 초과분만 반영
 * 전에는 모든 종목이 17~22점 기본으로 받아서 차별화 없었음
 */
export function scoreSupply(s: SupplyDetails): number {
  let score = 0;

  // OBV 추세 (50pts)
  if (s.obvTrend === 'up') score += 50;
  else if (s.obvTrend === 'neutral') score += 20;
  // down = 0

  // 상승/하락 거래량 비율 (50pts)
  // 평균 0.50을 기준으로 초과분만 점수 부여 → 차별화
  // 0.70이상 = 50pts, 0.65 = 35pts, 0.60 = 20pts, 0.55 = 8pts, 0.50이하 = 0pts
  const excess = Math.max(0, s.upVolumeRatio - 0.50);
  score += Math.min(Math.round(excess * 250), 50);

  return Math.min(Math.round(score), 100);
}

/**
 * 센티먼트 점수 (0-100)
 * 반대매매 논리: 공포 구간이 매수 기회
 * 수정: 중립 구간(F&G 40~60)도 합리적 점수 부여
 */
export function scoreSentiment(sentiment: SentimentData): number {
  let score = 0;

  // Fear & Greed (70pts) — 공포 = 매수 기회
  const fg = sentiment.fearGreed;
  if (fg <= 20) score += 70;       // 극단적 공포
  else if (fg <= 35) score += 60;  // 공포
  else if (fg <= 50) score += 48;  // 중립~약공포
  else if (fg <= 65) score += 35;  // 중립~탐욕
  else if (fg <= 80) score += 20;  // 탐욕
  else score += 8;                  // 극단적 탐욕

  // VIX (30pts) — 높을수록 공포 = 반등 기대
  if (sentiment.vix != null) {
    if (sentiment.vix > 35) score += 30;
    else if (sentiment.vix > 28) score += 24;
    else if (sentiment.vix > 22) score += 18;
    else if (sentiment.vix > 17) score += 12;
    else if (sentiment.vix > 13) score += 7;
    else score += 3;
  } else {
    score += 12; // 데이터 없을 때 중립
  }

  return Math.min(Math.round(score), 100);
}

export function computeComposite(scores: Omit<ScoreBreakdown, 'composite'>): number {
  return Math.round(
    scores.technical  * 0.35 +
    scores.fundamental * 0.20 +
    scores.supply     * 0.30 +
    scores.sentiment  * 0.15
  );
}

/**
 * 신호 판단
 * 65+ 강한 매수 (기존 70에서 하향 — 현실적 임계값)
 * 48~64 관망/분할매수
 * 48 미만 신호없음
 */
export function getSignal(composite: number): Signal {
  if (composite >= 65) return 'strong_buy';
  if (composite >= 48) return 'watch';
  return 'no_signal';
}
