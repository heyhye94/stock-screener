import { NextResponse } from 'next/server';
import { fetchSentiment } from '@/lib/sentiment';

export const runtime = 'nodejs';
export const revalidate = 900;

export async function GET() {
  const data = await fetchSentiment();
  return NextResponse.json(data);
}
