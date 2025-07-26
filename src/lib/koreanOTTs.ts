// 국내 OTT 정보 데이터
export interface KoreanOTT {
  id: string;
  name: string;
  name_en: string;
  logo_path: string;
  type: 'subscription' | 'free' | 'hybrid';
  price: {
    monthly?: string;
    yearly?: string;
    basic?: string;
    standard?: string;
    premium?: string;
  };
  features: string[];
  strengths: string[];
  weaknesses: string[];
  website: string;
  available_in_korea: boolean;
}

export const koreanOTTs: KoreanOTT[] = [
  {
    id: 'wavve',
    name: '웨이브',
    name_en: 'Wavve',
    logo_path: '/ott-logos/wavve.png',
    type: 'subscription',
    price: {
      monthly: '₩13,900',
      yearly: '₩139,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 4명'],
    strengths: ['한국 콘텐츠', 'KBS/MBC/SBS', '실시간 방송'],
    weaknesses: ['해외 콘텐츠 제한적', '일부 영화 부족'],
    website: 'https://www.wavve.com',
    available_in_korea: true
  },
  {
    id: 'tving',
    name: '티빙',
    name_en: 'Tving',
    logo_path: '/ott-logos/tving.png',
    type: 'subscription',
    price: {
      monthly: '₩13,900',
      yearly: '₩139,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 4명'],
    strengths: ['CJ ENM 콘텐츠', 'tvN/JTBC', '독점 콘텐츠'],
    weaknesses: ['해외 콘텐츠 제한적'],
    website: 'https://www.tving.com',
    available_in_korea: true
  },
  {
    id: 'watcha',
    name: '왓챠',
    name_en: 'Watcha',
    logo_path: '/ott-logos/watcha.png',
    type: 'subscription',
    price: {
      monthly: '₩12,900',
      yearly: '₩129,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 4명'],
    strengths: ['독립 영화', '다양한 장르', '추천 알고리즘'],
    weaknesses: ['메이저 콘텐츠 부족'],
    website: 'https://www.watcha.com',
    available_in_korea: true
  },
  {
    id: 'laftel',
    name: '라프텔',
    name_en: 'Laftel',
    logo_path: '/ott-logos/laftel.png',
    type: 'subscription',
    price: {
      monthly: '₩9,900',
      yearly: '₩99,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 2명'],
    strengths: ['애니메이션 전문', '일본 애니', '독점 콘텐츠'],
    weaknesses: ['애니메이션만', '일반 영화 없음'],
    website: 'https://www.laftel.net',
    available_in_korea: true
  },
  {
    id: 'netflix',
    name: '넷플릭스',
    name_en: 'Netflix',
    logo_path: 'https://image.tmdb.org/t/p/original/9A1JSVmSxsyaBK4SUfYqNLzAHvA.jpg',
    type: 'subscription',
    price: {
      basic: '₩17,000',
      standard: '₩18,500',
      premium: '₩22,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 4명'],
    strengths: ['다양한 장르', '오리지널 콘텐츠', '글로벌 콘텐츠'],
    weaknesses: ['일부 영화 부족', '가격 상승'],
    website: 'https://www.netflix.com',
    available_in_korea: true
  },
  {
    id: 'disneyplus',
    name: '디즈니플러스',
    name_en: 'Disney Plus',
    logo_path: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NFQ5vZYt0Wy0e.jpg',
    type: 'subscription',
    price: {
      monthly: '₩9,900',
      yearly: '₩99,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 4명'],
    strengths: ['디즈니', '마블', '스타워즈', '내셔널지오그래픽'],
    weaknesses: ['장르 제한적', '성인 콘텐츠 부족'],
    website: 'https://www.disneyplus.com',
    available_in_korea: true
  },
  {
    id: 'apple-tv-plus',
    name: '애플TV플러스',
    name_en: 'Apple TV Plus',
    logo_path: 'https://image.tmdb.org/t/p/original/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg',
    type: 'subscription',
    price: {
      monthly: '₩6,500',
      yearly: '₩65,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 6명'],
    strengths: ['애플 오리지널', '고품질 콘텐츠', '합리적 가격'],
    weaknesses: ['콘텐츠 부족', '라이브러리 제한적'],
    website: 'https://tv.apple.com',
    available_in_korea: true
  },
  {
    id: 'amazon-prime',
    name: '아마존프라임',
    name_en: 'Amazon Prime Video',
    logo_path: 'https://image.tmdb.org/t/p/original/68MNrwlkpF7WnmVPXL6GqLCKE00.jpg',
    type: 'subscription',
    price: {
      monthly: '₩4,900',
      yearly: '₩49,000'
    },
    features: ['4K 지원', '다운로드', '동시 시청 3명'],
    strengths: ['다양한 콘텐츠', '합리적 가격', '아마존 혜택'],
    weaknesses: ['인터페이스 복잡', '한국 콘텐츠 부족'],
    website: 'https://www.primevideo.com',
    available_in_korea: true
  }
];

// OTT ID로 정보 찾기
export const getOTTInfo = (ottId: string): KoreanOTT | undefined => {
  return koreanOTTs.find(ott => ott.id === ottId);
};

// 모든 한국 OTT 정보 가져오기
export const getAllKoreanOTTs = (): KoreanOTT[] => {
  return koreanOTTs.filter(ott => ott.available_in_korea);
};

// OTT 타입별 분류
export const getOTTsByType = (type: 'subscription' | 'free' | 'hybrid'): KoreanOTT[] => {
  return koreanOTTs.filter(ott => ott.type === type);
}; 