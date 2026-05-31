import { NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const out: Record<string, unknown> = {};

  try {
    // Step 1: fc.yahoo.com cookie
    const r1 = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA, 'Accept': '*/*' },
      redirect: 'follow',
      cache: 'no-store',
    });
    const rawCookie = r1.headers.get('set-cookie') ?? '';
    const cookie = rawCookie.split(';')[0].trim();
    out.fc_status = r1.status;
    out.fc_has_cookie = cookie.length > 5;

    // Step 2: getcrumb with cookie
    const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' },
      cache: 'no-store',
    });
    const crumbText = await r2.text();
    const crumbOk = r2.ok && crumbText.length >= 4 && !crumbText.startsWith('<') && !crumbText.includes('Request');
    out.crumb_status = r2.status;
    out.crumb_value = crumbText.trim().slice(0, 30);
    out.crumb_ok = crumbOk;

    // Step 3: v8/chart WITHOUT crumb (just cookie)
    const r3 = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d',
      { headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' }, cache: 'no-store' }
    );
    const body3 = await r3.text();
    out.chart_no_crumb_status = r3.status;
    out.chart_no_crumb_snippet = body3.slice(0, 120);

    // Step 4: v8/chart WITH crumb (if available)
    if (crumbOk) {
      const crumbEnc = encodeURIComponent(crumbText.trim());
      const r4 = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d&crumb=${crumbEnc}`,
        { headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' }, cache: 'no-store' }
      );
      const body4 = await r4.text();
      out.chart_with_crumb_status = r4.status;
      out.chart_with_crumb_snippet = body4.slice(0, 120);
    }

    // Step 5: Try yahoo-finance2 style URL (v8 with cookie only, different host)
    const r5 = await fetch(
      'https://query2.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d',
      { headers: { 'User-Agent': UA, 'Cookie': cookie, 'Referer': 'https://finance.yahoo.com/' }, cache: 'no-store' }
    );
    const body5 = await r5.text();
    out.query2_chart_status = r5.status;
    out.query2_chart_snippet = body5.slice(0, 120);

  } catch (e: unknown) {
    out.error = String(e);
  }

  return NextResponse.json(out);
}
