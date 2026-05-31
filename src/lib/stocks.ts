import { StockMeta } from '@/types';

// 성능 최적화: 60종목 (30 국내 + 30 미국)
// Vercel 30초 타임아웃 내 안정적 처리

export const KOREAN_STOCKS: StockMeta[] = [
  { ticker: '005930.KS', name: '삼성전자', market: 'KR', sector: '반도체' },
  { ticker: '000660.KS', name: 'SK하이닉스', market: 'KR', sector: '반도체' },
  { ticker: '042700.KS', name: '한미반도체', market: 'KR', sector: '반도체장비' },
  { ticker: '035420.KS', name: 'NAVER', market: 'KR', sector: 'IT' },
  { ticker: '035720.KS', name: '카카오', market: 'KR', sector: 'IT' },
  { ticker: '259960.KS', name: '크래프톤', market: 'KR', sector: '게임' },
  { ticker: '036570.KS', name: 'NC소프트', market: 'KR', sector: '게임' },
  { ticker: '068270.KS', name: '셀트리온', market: 'KR', sector: '바이오' },
  { ticker: '207940.KS', name: '삼성바이오로직스', market: 'KR', sector: '바이오' },
  { ticker: '128940.KS', name: '한미약품', market: 'KR', sector: '제약' },
  { ticker: '145020.KS', name: '휴젤', market: 'KR', sector: '바이오' },
  { ticker: '006400.KS', name: '삼성SDI', market: 'KR', sector: '배터리' },
  { ticker: '051910.KS', name: 'LG화학', market: 'KR', sector: '배터리' },
  { ticker: '373220.KS', name: 'LG에너지솔루션', market: 'KR', sector: '배터리' },
  { ticker: '247540.KS', name: '에코프로비엠', market: 'KR', sector: '배터리소재' },
  { ticker: '272450.KS', name: '포스코퓨처엠', market: 'KR', sector: '배터리소재' },
  { ticker: '005380.KS', name: '현대차', market: 'KR', sector: '자동차' },
  { ticker: '000270.KS', name: '기아', market: 'KR', sector: '자동차' },
  { ticker: '012330.KS', name: '현대모비스', market: 'KR', sector: '자동차부품' },
  { ticker: '066570.KS', name: 'LG전자', market: 'KR', sector: '전자' },
  { ticker: '009150.KS', name: '삼성전기', market: 'KR', sector: '전자부품' },
  { ticker: '034220.KS', name: 'LG디스플레이', market: 'KR', sector: '디스플레이' },
  { ticker: '017670.KS', name: 'SK텔레콤', market: 'KR', sector: '통신' },
  { ticker: '030200.KS', name: 'KT', market: 'KR', sector: '통신' },
  { ticker: '105560.KS', name: 'KB금융', market: 'KR', sector: '금융' },
  { ticker: '086790.KS', name: '하나금융지주', market: 'KR', sector: '금융' },
  { ticker: '005490.KS', name: 'POSCO홀딩스', market: 'KR', sector: '철강' },
  { ticker: '009540.KS', name: 'HD한국조선해양', market: 'KR', sector: '조선' },
  { ticker: '010950.KS', name: 'S-Oil', market: 'KR', sector: '에너지' },
  { ticker: '041510.KQ', name: 'SM엔터테인먼트', market: 'KR', sector: '엔터' },
];

export const US_STOCKS: StockMeta[] = [
  // AI/반도체
  { ticker: 'NVDA', name: 'NVIDIA', market: 'US', sector: 'AI/Semicon' },
  { ticker: 'AMD', name: 'AMD', market: 'US', sector: 'Semicon' },
  { ticker: 'AVGO', name: 'Broadcom', market: 'US', sector: 'Semicon' },
  { ticker: 'ARM', name: 'ARM Holdings', market: 'US', sector: 'Semicon' },
  { ticker: 'SMCI', name: 'Super Micro', market: 'US', sector: 'AI Infra' },
  { ticker: 'AMAT', name: 'Applied Materials', market: 'US', sector: 'Semicon Equip' },
  // 빅테크
  { ticker: 'AAPL', name: 'Apple', market: 'US', sector: 'Tech' },
  { ticker: 'MSFT', name: 'Microsoft', market: 'US', sector: 'Tech' },
  { ticker: 'GOOGL', name: 'Alphabet', market: 'US', sector: 'Tech' },
  { ticker: 'META', name: 'Meta', market: 'US', sector: 'Tech' },
  { ticker: 'AMZN', name: 'Amazon', market: 'US', sector: 'Cloud/Commerce' },
  // 성장주
  { ticker: 'TSLA', name: 'Tesla', market: 'US', sector: 'EV' },
  { ticker: 'NFLX', name: 'Netflix', market: 'US', sector: 'Streaming' },
  { ticker: 'PLTR', name: 'Palantir', market: 'US', sector: 'AI/Data' },
  { ticker: 'CRM', name: 'Salesforce', market: 'US', sector: 'Software' },
  { ticker: 'ORCL', name: 'Oracle', market: 'US', sector: 'Software' },
  { ticker: 'SNOW', name: 'Snowflake', market: 'US', sector: 'Cloud' },
  { ticker: 'NET', name: 'Cloudflare', market: 'US', sector: 'Cloud' },
  { ticker: 'UBER', name: 'Uber', market: 'US', sector: 'Mobility' },
  { ticker: 'SHOP', name: 'Shopify', market: 'US', sector: 'Commerce' },
  // 헬스케어
  { ticker: 'LLY', name: 'Eli Lilly', market: 'US', sector: 'Pharma' },
  { ticker: 'NVO', name: 'Novo Nordisk', market: 'US', sector: 'Pharma' },
  { ticker: 'ISRG', name: 'Intuitive Surgical', market: 'US', sector: 'MedTech' },
  { ticker: 'MRNA', name: 'Moderna', market: 'US', sector: 'Biotech' },
  // 금융
  { ticker: 'JPM', name: 'JPMorgan', market: 'US', sector: 'Finance' },
  { ticker: 'GS', name: 'Goldman Sachs', market: 'US', sector: 'Finance' },
  { ticker: 'V', name: 'Visa', market: 'US', sector: 'Payments' },
  { ticker: 'COIN', name: 'Coinbase', market: 'US', sector: 'Crypto' },
  // 기타
  { ticker: 'COST', name: 'Costco', market: 'US', sector: 'Retail' },
  { ticker: 'XOM', name: 'ExxonMobil', market: 'US', sector: 'Energy' },
];

export const ALL_STOCKS: StockMeta[] = [...KOREAN_STOCKS, ...US_STOCKS];
