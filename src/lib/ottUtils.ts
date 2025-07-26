import { KoreanOTT, getOTTInfo } from './koreanOTTs';

// TMDB API의 OTT 정보와 국내 OTT 정보를 결합
export interface CombinedOTTInfo {
  id: string;
  name: string;
  name_en: string;
  logo_path: string;
  type: 'subscription' | 'free' | 'hybrid';
  price?: {
    monthly?: string;
    yearly?: string;
    basic?: string;
    premium?: string;
  };
  features?: string[];
  strengths?: string[];
  weaknesses?: string[];
  website?: string;
  source: 'tmdb' | 'korean';
  available_in_korea: boolean;
}

// TMDB OTT 정보를 국내 OTT 정보와 결합
export const combineOTTInfo = (tmdbProviders: unknown): CombinedOTTInfo[] => {
  const combinedOTTs: CombinedOTTInfo[] = [];
  
  // TMDB에서 제공하는 OTT 정보 처리
  if (tmdbProviders && typeof tmdbProviders === 'object' && 'flatrate' in tmdbProviders) {
    const providers = tmdbProviders as { flatrate: Array<{ provider_id: number; provider_name: string; logo_path: string }> };
    providers.flatrate.forEach((provider) => {
      const koreanOTT = getOTTInfo(provider.provider_name.toLowerCase().replace(/\s+/g, '-'));
      
      if (koreanOTT) {
        // 국내 OTT 정보가 있으면 결합
        combinedOTTs.push({
          id: koreanOTT.id,
          name: koreanOTT.name,
          name_en: koreanOTT.name_en,
          logo_path: koreanOTT.logo_path,
          type: koreanOTT.type,
          price: koreanOTT.price,
          features: koreanOTT.features,
          strengths: koreanOTT.strengths,
          weaknesses: koreanOTT.weaknesses,
          website: koreanOTT.website,
          source: 'korean',
          available_in_korea: true
        });
      } else {
        // 국내 정보가 없으면 TMDB 정보 사용
        combinedOTTs.push({
          id: provider.provider_id.toString(),
          name: provider.provider_name,
          name_en: provider.provider_name,
          logo_path: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          type: 'subscription',
          source: 'tmdb',
          available_in_korea: true
        });
      }
    });
  }
  
  // 국내 OTT 중 TMDB에 없는 것들 추가 (예시로 일부만)
  const additionalKoreanOTTs = ['wavve', 'tving', 'watcha', 'laftel'];
  
  additionalKoreanOTTs.forEach(ottId => {
    const koreanOTT = getOTTInfo(ottId);
    if (koreanOTT && !combinedOTTs.find(ott => ott.id === ottId)) {
      combinedOTTs.push({
        id: koreanOTT.id,
        name: koreanOTT.name,
        name_en: koreanOTT.name_en,
        logo_path: koreanOTT.logo_path,
        type: koreanOTT.type,
        price: koreanOTT.price,
        features: koreanOTT.features,
        strengths: koreanOTT.strengths,
        weaknesses: koreanOTT.weaknesses,
        website: koreanOTT.website,
        source: 'korean',
        available_in_korea: true
      });
    }
  });
  
  return combinedOTTs;
};

// OTT 정보를 가격순으로 정렬
export const sortOTTsByPrice = (otts: CombinedOTTInfo[]): CombinedOTTInfo[] => {
  return otts.sort((a, b) => {
    const priceA = a.price?.monthly || a.price?.basic || '₩0';
    const priceB = b.price?.monthly || b.price?.basic || '₩0';
    
    const numA = parseInt(priceA.replace(/[^\d]/g, ''));
    const numB = parseInt(priceB.replace(/[^\d]/g, ''));
    
    return numA - numB;
  });
};

// OTT 정보를 타입별로 분류
export const groupOTTsByType = (otts: CombinedOTTInfo[]) => {
  const grouped = {
    subscription: otts.filter(ott => ott.type === 'subscription'),
    free: otts.filter(ott => ott.type === 'free'),
    hybrid: otts.filter(ott => ott.type === 'hybrid')
  };
  
  return grouped;
};

// OTT 정보를 한국어/영어로 필터링
export const filterOTTsByLanguage = (otts: CombinedOTTInfo[], language: 'korean' | 'english' | 'all') => {
  if (language === 'all') return otts;
  
  return otts.filter(ott => {
    if (language === 'korean') {
      return ott.source === 'korean' || ott.name.includes('웨이브') || ott.name.includes('티빙');
    } else {
      return ott.source === 'tmdb' || ott.name_en.includes('Netflix') || ott.name_en.includes('Disney');
    }
  });
}; 