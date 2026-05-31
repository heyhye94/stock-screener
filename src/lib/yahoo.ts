export interface OHLCVData {
  closes: number[];
  highs: number[];
  lows: number[];
  opens: number[];
  volumes: number[];
  timestamps: number[];
}

export interface YahooFundamentals {
  pe: number | null;
  pb: number | null;
  roe: number | null;
  revenueGrowth: number | null;
  debtToEquity: number | null;
  price: number;
  change: number;
  changePercent: number;
}

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function fetchOHLCV(ticker: string): Promise<OHLCVData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=6mo`;
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const quote = result.indicators?.quote?.[0];
    if (!quote) return null;

    const closes: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const opens: number[] = [];
    const volumes: number[] = [];
    const timestamps: number[] = result.timestamp ?? [];

    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] == null) continue;
      closes.push(quote.close[i]);
      highs.push(quote.high[i] ?? quote.close[i]);
      lows.push(quote.low[i] ?? quote.close[i]);
      opens.push(quote.open[i] ?? quote.close[i]);
      volumes.push(quote.volume[i] ?? 0);
    }

    return { closes, highs, lows, opens, volumes, timestamps };
  } catch {
    return null;
  }
}

export async function fetchFundamentals(ticker: string): Promise<YahooFundamentals | null> {
  try {
    const modules = 'defaultKeyStatistics,financialData,summaryDetail,price';
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`;
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const r = data?.quoteSummary?.result?.[0];
    if (!r) return null;

    const price = r.price;

    return {
      pe: r.summaryDetail?.trailingPE?.raw ?? r.defaultKeyStatistics?.forwardPE?.raw ?? null,
      pb: r.defaultKeyStatistics?.priceToBook?.raw ?? null,
      roe: r.financialData?.returnOnEquity?.raw ?? null,
      revenueGrowth: r.financialData?.revenueGrowth?.raw ?? null,
      debtToEquity: r.financialData?.debtToEquity?.raw ?? null,
      price: price?.regularMarketPrice?.raw ?? 0,
      change: price?.regularMarketChange?.raw ?? 0,
      changePercent: price?.regularMarketChangePercent?.raw ?? 0,
    };
  } catch {
    return null;
  }
}
