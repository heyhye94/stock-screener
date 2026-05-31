export interface SentimentData {
  fearGreed: number;
  fearGreedLabel: string;
  vix: number | null;
  updatedAt: string;
}

function getFearGreedLabel(value: number): string {
  if (value <= 25) return '극단적 공포';
  if (value <= 40) return '공포';
  if (value <= 55) return '중립';
  if (value <= 75) return '탐욕';
  return '극단적 탐욕';
}

export async function fetchFearGreed(): Promise<number> {
  try {
    const res = await fetch(
      'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 900 },
      }
    );
    if (!res.ok) return 50;
    const data = await res.json();
    const score = data?.fear_and_greed?.score;
    return typeof score === 'number' ? Math.round(score) : 50;
  } catch {
    return 50;
  }
}

export async function fetchVIX(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=5d',
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 900 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (!closes || closes.length === 0) return null;
    const last = closes.filter(Boolean).pop();
    return typeof last === 'number' ? Math.round(last * 10) / 10 : null;
  } catch {
    return null;
  }
}

export async function fetchSentiment(): Promise<SentimentData> {
  const [fearGreed, vix] = await Promise.all([fetchFearGreed(), fetchVIX()]);
  return {
    fearGreed,
    fearGreedLabel: getFearGreedLabel(fearGreed),
    vix,
    updatedAt: new Date().toISOString(),
  };
}
