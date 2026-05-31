import { StockMeta } from '@/types';

export const KOREAN_STOCKS: StockMeta[] = [
  { ticker: '005930.KS', name: '삼성전자', market: 'KR', sector: '반도체' },
  { ticker: '000660.KS', name: 'SK하이닉스', market: 'KR', sector: '반도체' },
  { ticker: '035420.KS', name: 'NAVER', market: 'KR', sector: 'IT' },
  { ticker: '035720.KS', name: '카카오', market: 'KR', sector: 'IT' },
  { ticker: '068270.KS', name: '셀트리온', market: 'KR', sector: '바이오' },
  { ticker: '207940.KS', name: '삼성바이오로직스', market: 'KR', sector: '바이오' },
  { ticker: '006400.KS', name: '삼성SDI', market: 'KR', sector: '배터리' },
  { ticker: '051910.KS', name: 'LG화학', market: 'KR', sector: '화학/배터리' },
  { ticker: '005380.KS', name: '현대차', market: 'KR', sector: '자동차' },
  { ticker: '000270.KS', name: '기아', market: 'KR', sector: '자동차' },
  { ticker: '066570.KS', name: 'LG전자', market: 'KR', sector: '전자' },
  { ticker: '017670.KS', name: 'SK텔레콤', market: 'KR', sector: '통신' },
  { ticker: '086790.KS', name: '하나금융지주', market: 'KR', sector: '금융' },
  { ticker: '105560.KS', name: 'KB금융', market: 'KR', sector: '금융' },
  { ticker: '032830.KS', name: '삼성생명', market: 'KR', sector: '보험' },
];

export const US_STOCKS: StockMeta[] = [
  { ticker: 'AAPL', name: 'Apple', market: 'US', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft', market: 'US', sector: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA', market: 'US', sector: 'Semiconductors' },
  { ticker: 'GOOGL', name: 'Alphabet', market: 'US', sector: 'Technology' },
  { ticker: 'META', name: 'Meta', market: 'US', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon', market: 'US', sector: 'E-Commerce/Cloud' },
  { ticker: 'TSLA', name: 'Tesla', market: 'US', sector: 'EV/Auto' },
  { ticker: 'AMD', name: 'AMD', market: 'US', sector: 'Semiconductors' },
  { ticker: 'AVGO', name: 'Broadcom', market: 'US', sector: 'Semiconductors' },
  { ticker: 'NFLX', name: 'Netflix', market: 'US', sector: 'Streaming' },
  { ticker: 'CRM', name: 'Salesforce', market: 'US', sector: 'Software' },
  { ticker: 'PLTR', name: 'Palantir', market: 'US', sector: 'AI/Software' },
  { ticker: 'ARM', name: 'ARM Holdings', market: 'US', sector: 'Semiconductors' },
  { ticker: 'ORCL', name: 'Oracle', market: 'US', sector: 'Software' },
  { ticker: 'JPM', name: 'JPMorgan', market: 'US', sector: 'Finance' },
];

export const ALL_STOCKS: StockMeta[] = [...KOREAN_STOCKS, ...US_STOCKS];
