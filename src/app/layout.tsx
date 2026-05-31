import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '매수 종목 스크리너',
  description: '실시간 매수 추천 종목 스크리닝 — 기술적·기본적·수급·센티먼트 4축 분석',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
