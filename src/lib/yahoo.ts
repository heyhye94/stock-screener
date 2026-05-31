const YAHOO_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const YAHOO_HEADERS = {
  'User-Agent': YAHOO_UA,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
};

export interface OHLCVData {
  closes: number[];
  highs: number[];
  lows: number[];
  opens: number[];
  volumes: number[];
  timestamps: number[];
  metaPrice?: number;
  metaPrevClose?: number;
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

// ── OHLCV (차트 데이터) ────────────────────────────────────────────────────
export async function fetchOHLCV(ticker: string): Promise<OHLCVData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=6mo`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 300 } });
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const quote = result.indicators?.quote?.[0];
    if (!quote) return null;

    const meta = result.meta ?? {};
    const timestamps: number[] = result.timestamp ?? [];

    const closes: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const opens: number[] = [];
    const volumes: number[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] == null) continue;
      closes.push(quote.close[i]);
      highs.push(quote.high[i] ?? quote.close[i]);
      lows.push(quote.low[i] ?? quote.close[i]);
      opens.push(quote.open[i] ?? quote.close[i]);
      volumes.push(quote.volume[i] ?? 0);
    }

    return {
      closes, highs, lows, opens, volumes, timestamps,
      metaPrice: meta.regularMarketPrice ?? undefined,
      metaPrevClose: meta.chartPreviousClose ?? meta.previousClose ?? undefined,
    };
  } catch {
    return null;
  }
}

// ── 기본적 데이터 (v7/quote — crumb 불필요) ────────────────────────────────
// Yahoo v10/quoteSummary는 2024년부터 crumb 필수 → v7/quote 사용
export async function fetchFundamentals(ticker: string): Promise<YahooFundamentals | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}&formatted=false`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = await res.json();
    const r = data?.quoteResponse?.result?.[0];
    if (!r) return null;

    // v7/quote에서 가져올 수 있는 것: PE, PB, EPS, 시가총액, 가격
    // ROE·매출성장·부채비율은 v7에 없음 → quoteSummary 필요하지만 crumb 이슈
    return {
      pe: r.trailingPE ?? r.forwardPE ?? null,
      pb: r.priceToBook ?? null,
      roe: null,
      revenueGrowth: null,
      debtToEquity: null,
      price: r.regularMarketPrice ?? 0,
      change: r.regularMarketChange ?? 0,
      changePercent: r.regularMarketChangePercent ?? 0,
    };
  } catch {
    return null;
  }
}

// ── 최신 뉴스 헤드라인 ────────────────────────────────────────────────────
export async function fetchNewsHeadline(ticker: string): Promise<string | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=1&quotesCount=0&enableFuzzyQuery=false`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const title: string | undefined = data?.news?.[0]?.title;
    if (!title) return null;
    // 60자 초과 시 자름
    return title.length > 60 ? title.slice(0, 57) + '…' : title;
  } catch {
    return null;
  }
}
