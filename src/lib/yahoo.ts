/**
 * Yahoo Finance 데이터 fetcher
 *
 * 2024년부터 Yahoo Finance가 서버(AWS) IP에서의 요청을 차단.
 * 해결책: fc.yahoo.com에서 쿠키 취득 → v1/test/getcrumb에서 크럼 취득 → 모든 API 요청에 포함
 */

const YAHOO_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// 모듈 레벨 캐시 — warm Lambda에서 재사용 (cold start 시 재취득)
let _auth: { cookie: string; crumb: string; ts: number } | null = null;

async function getYahooAuth(): Promise<{ cookie: string; crumb: string }> {
  const now = Date.now();
  if (_auth && now - _auth.ts < 45 * 60 * 1000) return _auth;   // 45분 캐시

  try {
    // Step 1: fc.yahoo.com에서 A3 세션 쿠키 취득
    const r1 = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': YAHOO_UA, 'Accept': '*/*' },
      redirect: 'follow',
      cache: 'no-store',
    });

    // Set-Cookie 헤더 추출 (Node.js 18에서는 첫 번째 값만 반환)
    const rawCookie = r1.headers.get('set-cookie') ?? '';
    // "A3=...; Expires=..." → "A3=..."
    const cookie = rawCookie.split(';')[0].trim();

    // Step 2: 쿠키로 크럼 취득
    const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': YAHOO_UA,
        'Cookie': cookie,
        'Referer': 'https://finance.yahoo.com/',
      },
      cache: 'no-store',
    });

    const crumb = r2.ok ? (await r2.text()).trim() : '';

    if (crumb.length >= 4 && !crumb.startsWith('<')) {
      _auth = { cookie, crumb, ts: now };
      return _auth;
    }

    // 쿠키 없이 크럼만 시도 (일부 환경에서 동작)
    const r3 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': YAHOO_UA },
      cache: 'no-store',
    });
    const crumb2 = r3.ok ? (await r3.text()).trim() : '';
    _auth = { cookie: '', crumb: crumb2, ts: now };
    return _auth;
  } catch {
    return { cookie: '', crumb: '' };
  }
}

function makeHeaders(cookie: string): Record<string, string> {
  const h: Record<string, string> = {
    'User-Agent': YAHOO_UA,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://finance.yahoo.com',
    'Referer': 'https://finance.yahoo.com/',
  };
  if (cookie) h['Cookie'] = cookie;
  return h;
}

// ─────────────────────────────────────────────────────────────────────────────
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

// ── OHLCV (기술적 지표용) ─────────────────────────────────────────────────
export async function fetchOHLCV(ticker: string): Promise<OHLCVData | null> {
  try {
    const { cookie, crumb } = await getYahooAuth();
    const crumbQ = crumb ? `&crumb=${encodeURIComponent(crumb)}` : '';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=6mo${crumbQ}`;

    const res = await fetch(url, {
      headers: makeHeaders(cookie),
      next: { revalidate: 300 },
    });
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

// ── 기본적 분석 (v10/quoteSummary — crumb 필수) ───────────────────────────
export async function fetchFundamentals(ticker: string): Promise<YahooFundamentals | null> {
  try {
    const { cookie, crumb } = await getYahooAuth();
    if (!crumb) return null;

    const modules = 'defaultKeyStatistics,financialData,summaryDetail,price';
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;

    const res = await fetch(url, {
      headers: makeHeaders(cookie),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const r = data?.quoteSummary?.result?.[0];
    if (!r) return null;

    const price = r.price ?? {};
    const keyStats = r.defaultKeyStatistics ?? {};
    const financial = r.financialData ?? {};
    const summary = r.summaryDetail ?? {};

    return {
      pe: summary.trailingPE?.raw ?? keyStats.forwardPE?.raw ?? null,
      pb: keyStats.priceToBook?.raw ?? null,
      roe: financial.returnOnEquity?.raw ?? null,
      revenueGrowth: financial.revenueGrowth?.raw ?? null,
      debtToEquity: financial.debtToEquity?.raw ?? null,
      price: price.regularMarketPrice?.raw ?? 0,
      change: price.regularMarketChange?.raw ?? 0,
      changePercent: price.regularMarketChangePercent?.raw ?? 0,
    };
  } catch {
    return null;
  }
}

// ── 최신 뉴스 헤드라인 ────────────────────────────────────────────────────
export async function fetchNewsHeadline(ticker: string): Promise<string | null> {
  try {
    const { cookie, crumb } = await getYahooAuth();
    const crumbQ = crumb ? `&crumb=${encodeURIComponent(crumb)}` : '';
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=1&quotesCount=0&enableFuzzyQuery=false${crumbQ}`;

    const res = await fetch(url, {
      headers: makeHeaders(cookie),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const title: string | undefined = data?.news?.[0]?.title;
    if (!title) return null;
    return title.length > 65 ? title.slice(0, 62) + '…' : title;
  } catch {
    return null;
  }
}
