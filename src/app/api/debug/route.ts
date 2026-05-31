import { NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const out: Record<string, unknown> = {};

  // Step 1: fc.yahoo.com
  try {
    const r1 = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA, 'Accept': '*/*' },
      redirect: 'follow',
      cache: 'no-store',
    });
    const rawCookie = r1.headers.get('set-cookie') ?? '';
    const cookie = rawCookie.split(';')[0].trim();
    out.fc_status = r1.status;
    out.fc_cookie_prefix = cookie.slice(0, 40);
    out.fc_has_cookie = cookie.length > 5;

    // Step 2: getcrumb with cookie
    const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' },
      cache: 'no-store',
    });
    const crumbText = await r2.text();
    out.crumb_status = r2.status;
    out.crumb_value = crumbText.slice(0, 30);
    out.crumb_ok = r2.ok && crumbText.length >= 4 && !crumbText.startsWith('<');

    // Step 3: Try OHLCV with crumb
    if (out.crumb_ok) {
      const crumb = encodeURIComponent(crumbText.trim());
      const r3 = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d&crumb=${crumb}`,
        { headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' }, cache: 'no-store' }
      );
      const body = await r3.text();
      out.chart_status = r3.status;
      out.chart_snippet = body.slice(0, 100);
    }

    // Step 4: Try query2 variant
    const r4 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' },
      cache: 'no-store',
    });
    const crumb2 = await r4.text();
    out.query2_crumb_status = r4.status;
    out.query2_crumb = crumb2.slice(0, 30);

  } catch (e: unknown) {
    out.error = String(e);
  }

  return NextResponse.json(out);
}
