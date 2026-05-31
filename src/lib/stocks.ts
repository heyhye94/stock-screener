import { StockMeta } from '@/types';

export const KOREAN_UNIVERSE: StockMeta[] = [
  // 반도체/IT
  { ticker: '005930.KS', name: '삼성전자', market: 'KR', sector: '반도체' },
  { ticker: '000660.KS', name: 'SK하이닉스', market: 'KR', sector: '반도체' },
  { ticker: '042700.KS', name: '한미반도체', market: 'KR', sector: '반도체장비' },
  { ticker: '000990.KS', name: 'DB하이텍', market: 'KR', sector: '반도체' },
  { ticker: '240810.KS', name: '원익IPS', market: 'KR', sector: '반도체장비' },
  { ticker: '035420.KS', name: 'NAVER', market: 'KR', sector: 'IT' },
  { ticker: '035720.KS', name: '카카오', market: 'KR', sector: 'IT' },
  { ticker: '036570.KS', name: 'NCsoft', market: 'KR', sector: '게임' },
  { ticker: '112040.KS', name: '위메이드', market: 'KR', sector: '게임' },
  { ticker: '259960.KS', name: '크래프톤', market: 'KR', sector: '게임' },
  // 바이오/헬스케어
  { ticker: '068270.KS', name: '셀트리온', market: 'KR', sector: '바이오' },
  { ticker: '207940.KS', name: '삼성바이오로직스', market: 'KR', sector: '바이오' },
  { ticker: '128940.KS', name: '한미약품', market: 'KR', sector: '제약' },
  { ticker: '000100.KS', name: '유한양행', market: 'KR', sector: '제약' },
  { ticker: '326030.KS', name: 'SK바이오팜', market: 'KR', sector: '바이오' },
  { ticker: '145020.KS', name: '휴젤', market: 'KR', sector: '바이오' },
  { ticker: '214150.KS', name: '클래시스', market: 'KR', sector: '의료기기' },
  { ticker: '041960.KS', name: '코미팜', market: 'KR', sector: '바이오' },
  // 2차전지
  { ticker: '006400.KS', name: '삼성SDI', market: 'KR', sector: '배터리' },
  { ticker: '051910.KS', name: 'LG화학', market: 'KR', sector: '배터리' },
  { ticker: '373220.KS', name: 'LG에너지솔루션', market: 'KR', sector: '배터리' },
  { ticker: '247540.KS', name: '에코프로비엠', market: 'KR', sector: '배터리소재' },
  { ticker: '086520.KS', name: '에코프로', market: 'KR', sector: '배터리소재' },
  { ticker: '272450.KS', name: '포스코퓨처엠', market: 'KR', sector: '배터리소재' },
  // 자동차
  { ticker: '005380.KS', name: '현대차', market: 'KR', sector: '자동차' },
  { ticker: '000270.KS', name: '기아', market: 'KR', sector: '자동차' },
  { ticker: '012330.KS', name: '현대모비스', market: 'KR', sector: '자동차부품' },
  { ticker: '011210.KS', name: '현대위아', market: 'KR', sector: '자동차부품' },
  // 전자/디스플레이
  { ticker: '066570.KS', name: 'LG전자', market: 'KR', sector: '전자' },
  { ticker: '034220.KS', name: 'LG디스플레이', market: 'KR', sector: '디스플레이' },
  { ticker: '009150.KS', name: '삼성전기', market: 'KR', sector: '전자부품' },
  { ticker: '028260.KS', name: '삼성물산', market: 'KR', sector: '지주' },
  // 통신
  { ticker: '017670.KS', name: 'SK텔레콤', market: 'KR', sector: '통신' },
  { ticker: '030200.KS', name: 'KT', market: 'KR', sector: '통신' },
  { ticker: '032640.KS', name: 'LG유플러스', market: 'KR', sector: '통신' },
  // 금융
  { ticker: '086790.KS', name: '하나금융지주', market: 'KR', sector: '금융' },
  { ticker: '105560.KS', name: 'KB금융', market: 'KR', sector: '금융' },
  { ticker: '316140.KS', name: '우리금융지주', market: 'KR', sector: '금융' },
  { ticker: '032830.KS', name: '삼성생명', market: 'KR', sector: '보험' },
  { ticker: '000810.KS', name: '삼성화재', market: 'KR', sector: '보험' },
  // 에너지/소재
  { ticker: '010950.KS', name: 'S-Oil', market: 'KR', sector: '에너지' },
  { ticker: '096770.KS', name: 'SK이노베이션', market: 'KR', sector: '에너지' },
  { ticker: '005490.KS', name: 'POSCO홀딩스', market: 'KR', sector: '철강' },
  { ticker: '010140.KS', name: '삼성중공업', market: 'KR', sector: '조선' },
  { ticker: '009540.KS', name: 'HD한국조선해양', market: 'KR', sector: '조선' },
  // 소비/유통
  { ticker: '139480.KS', name: '이마트', market: 'KR', sector: '유통' },
  { ticker: '004170.KS', name: '신세계', market: 'KR', sector: '유통' },
  { ticker: '271560.KS', name: '오리온', market: 'KR', sector: '음식료' },
  { ticker: '097950.KS', name: 'CJ제일제당', market: 'KR', sector: '음식료' },
  // KOSDAQ 성장주
  { ticker: '357780.KQ', name: '솔브레인', market: 'KR', sector: '반도체소재' },
  { ticker: '036810.KQ', name: '에프에스티', market: 'KR', sector: '반도체장비' },
  { ticker: '950130.KQ', name: '엑스페릭스', market: 'KR', sector: '반도체' },
  { ticker: '196170.KQ', name: '알테오젠', market: 'KR', sector: '바이오' },
  { ticker: '108490.KQ', name: '로보스타', market: 'KR', sector: '로봇' },
  { ticker: '214430.KQ', name: '아이센스', market: 'KR', sector: '의료기기' },
  { ticker: '095340.KQ', name: 'ISC', market: 'KR', sector: '반도체' },
  { ticker: '041510.KQ', name: 'SM엔터테인먼트', market: 'KR', sector: '엔터' },
  { ticker: '035900.KQ', name: 'JYP엔터테인먼트', market: 'KR', sector: '엔터' },
  { ticker: '122870.KQ', name: '와이지엔터테인먼트', market: 'KR', sector: '엔터' },
];

export const US_UNIVERSE: StockMeta[] = [
  // AI/반도체
  { ticker: 'NVDA', name: 'NVIDIA', market: 'US', sector: 'AI/Semiconductors' },
  { ticker: 'AMD', name: 'AMD', market: 'US', sector: 'Semiconductors' },
  { ticker: 'AVGO', name: 'Broadcom', market: 'US', sector: 'Semiconductors' },
  { ticker: 'ARM', name: 'ARM Holdings', market: 'US', sector: 'Semiconductors' },
  { ticker: 'AMAT', name: 'Applied Materials', market: 'US', sector: 'Semiconductor Equipment' },
  { ticker: 'KLAC', name: 'KLA Corp', market: 'US', sector: 'Semiconductor Equipment' },
  { ticker: 'MRVL', name: 'Marvell Tech', market: 'US', sector: 'Semiconductors' },
  { ticker: 'SMCI', name: 'Super Micro', market: 'US', sector: 'AI Infrastructure' },
  // 빅테크
  { ticker: 'AAPL', name: 'Apple', market: 'US', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft', market: 'US', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet', market: 'US', sector: 'Technology' },
  { ticker: 'META', name: 'Meta', market: 'US', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon', market: 'US', sector: 'E-Commerce/Cloud' },
  // 성장주
  { ticker: 'TSLA', name: 'Tesla', market: 'US', sector: 'EV/Auto' },
  { ticker: 'NFLX', name: 'Netflix', market: 'US', sector: 'Streaming' },
  { ticker: 'PLTR', name: 'Palantir', market: 'US', sector: 'AI/Software' },
  { ticker: 'CRM', name: 'Salesforce', market: 'US', sector: 'Software' },
  { ticker: 'ORCL', name: 'Oracle', market: 'US', sector: 'Software' },
  { ticker: 'SNOW', name: 'Snowflake', market: 'US', sector: 'Cloud' },
  { ticker: 'DDOG', name: 'Datadog', market: 'US', sector: 'Cloud' },
  { ticker: 'NET', name: 'Cloudflare', market: 'US', sector: 'Cloud' },
  { ticker: 'UBER', name: 'Uber', market: 'US', sector: 'Mobility' },
  { ticker: 'ABNB', name: 'Airbnb', market: 'US', sector: 'Travel' },
  { ticker: 'SHOP', name: 'Shopify', market: 'US', sector: 'E-Commerce' },
  // 헬스케어
  { ticker: 'LLY', name: 'Eli Lilly', market: 'US', sector: 'Pharma' },
  { ticker: 'NVO', name: 'Novo Nordisk', market: 'US', sector: 'Pharma' },
  { ticker: 'ABBV', name: 'AbbVie', market: 'US', sector: 'Pharma' },
  { ticker: 'MRNA', name: 'Moderna', market: 'US', sector: 'Biotech' },
  { ticker: 'ISRG', name: 'Intuitive Surgical', market: 'US', sector: 'Medical Devices' },
  // 금융
  { ticker: 'JPM', name: 'JPMorgan', market: 'US', sector: 'Finance' },
  { ticker: 'GS', name: 'Goldman Sachs', market: 'US', sector: 'Finance' },
  { ticker: 'V', name: 'Visa', market: 'US', sector: 'Payments' },
  { ticker: 'MA', name: 'Mastercard', market: 'US', sector: 'Payments' },
  { ticker: 'COIN', name: 'Coinbase', market: 'US', sector: 'Crypto/Finance' },
  // 에너지/소재
  { ticker: 'XOM', name: 'ExxonMobil', market: 'US', sector: 'Energy' },
  { ticker: 'CVX', name: 'Chevron', market: 'US', sector: 'Energy' },
  // 소비재
  { ticker: 'AMZN', name: 'Amazon', market: 'US', sector: 'Consumer' },
  { ticker: 'COST', name: 'Costco', market: 'US', sector: 'Retail' },
  { ticker: 'NKE', name: 'Nike', market: 'US', sector: 'Consumer' },
  // 방산/우주
  { ticker: 'LMT', name: 'Lockheed Martin', market: 'US', sector: 'Defense' },
  { ticker: 'RTX', name: 'RTX Corp', market: 'US', sector: 'Defense' },
];

// 중복 제거
function dedup(arr: StockMeta[]): StockMeta[] {
  const seen = new Set<string>();
  return arr.filter(s => {
    if (seen.has(s.ticker)) return false;
    seen.add(s.ticker);
    return true;
  });
}

export const KOREAN_STOCKS = dedup(KOREAN_UNIVERSE);
export const US_STOCKS = dedup(US_UNIVERSE);
export const ALL_STOCKS = dedup([...KOREAN_UNIVERSE, ...US_UNIVERSE]);
