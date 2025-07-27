import { KOREAN_OTT_PLATFORMS, findKoreanOTTProviders } from './koreanOTTs';

export interface OTTProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  strengths: string[];
  weaknesses: string[];
  availableContent: string[];
}

// OTT 정보가 있는지 체크하는 재사용 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasOTT(result: any): boolean {
  // 1. 로컬 데이터의 ottPlatforms 배열 체크
  if (result.ottPlatforms && Array.isArray(result.ottPlatforms) && result.ottPlatforms.length > 0) {
    return true;
  }

  // 2. TMDB ott_providers 구조 체크 (더 유연하게)
  if (result.ott_providers) {
    // KR 키가 있는 경우
    if (result.ott_providers.KR) {
      const kr = result.ott_providers.KR;
      // flatrate, buy, rent 중 하나라도 있으면 통과
      if ((Array.isArray(kr.flatrate) && kr.flatrate.length > 0) ||
          (Array.isArray(kr.buy) && kr.buy.length > 0) ||
          (Array.isArray(kr.rent) && kr.rent.length > 0)) {
        return true;
      }
    }
    
    // 다른 국가 코드가 있는 경우도 체크
    for (const countryCode in result.ott_providers) {
      const country = result.ott_providers[countryCode];
      if (country && (
        (Array.isArray(country.flatrate) && country.flatrate.length > 0) ||
        (Array.isArray(country.buy) && country.buy.length > 0) ||
        (Array.isArray(country.rent) && country.rent.length > 0)
      )) {
        return true;
      }
    }
  }

  return false;
}

// 한국 OTT 정보가 있는지 체크하는 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasKoreanOTT(result: any): boolean {
  return !!(
    result.korean_ott_providers &&
    Array.isArray(result.korean_ott_providers) &&
    result.korean_ott_providers.length > 0
  );
}

// TMDB 또는 한국 OTT 정보가 있는지 체크하는 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasAnyOTT(result: any): boolean {
  return hasOTT(result) || hasKoreanOTT(result);
}

// OTT 정보가 있는 콘텐츠만 필터링하는 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterByOTT(results: any[]): any[] {
  return results.filter(result => hasAnyOTT(result));
}

// OTT 정보 디버깅을 위한 함수 추가
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debugOTTInfo(result: any): void {
  console.log('=== OTT 정보 디버깅 ===');
  console.log('제목:', result.title || result.name);
  console.log('ottPlatforms:', result.ottPlatforms);
  console.log('ott_providers:', result.ott_providers);
  console.log('korean_ott_providers:', result.korean_ott_providers);
  
  if (result.ott_providers) {
    console.log('ott_providers 키들:', Object.keys(result.ott_providers));
    if (result.ott_providers.KR) {
      console.log('KR 구조:', result.ott_providers.KR);
    }
  }
  
  console.log('hasOTT 결과:', hasOTT(result));
  console.log('hasAnyOTT 결과:', hasAnyOTT(result));
  console.log('=====================');
}

export const combineOTTData = (tmdbProviders: unknown, movieTitle: string): OTTProvider[] => {
  const combinedProviders: OTTProvider[] = [];
  
  // 한국 OTT 정보 확인
  const koreanProviders = findKoreanOTTProviders(movieTitle);
  
  // TMDB 데이터 처리
  if (tmdbProviders && typeof tmdbProviders === 'object' && 'results' in tmdbProviders) {
    const providers = tmdbProviders as { results?: { KR?: unknown } };
    if (providers.results?.KR && Array.isArray(providers.results.KR)) {
      providers.results.KR.forEach((provider: unknown) => {
        if (provider && typeof provider === 'object' && 'provider_name' in provider) {
          const providerData = provider as { provider_name: string; provider_id: number };
          const koreanOTT = KOREAN_OTT_PLATFORMS.find(ott => 
            ott.name.toLowerCase().includes(providerData.provider_name.toLowerCase()) ||
            providerData.provider_name.toLowerCase().includes(ott.name.toLowerCase())
          );
          
          if (koreanOTT) {
            combinedProviders.push({
              id: koreanOTT.name.toLowerCase().replace(/\s+/g, '-'),
              name: koreanOTT.name,
              logo: koreanOTT.logo,
              description: `${koreanOTT.name}에서 시청 가능합니다`,
              features: ['VOD 서비스', '다중 프로필', '오프라인 시청'],
              strengths: ['다양한 콘텐츠', '고품질 화질'],
              weaknesses: ['구독료 발생'],
              availableContent: [movieTitle]
            });
          }
        }
      });
    }
  }
  
  // 한국 OTT 정보 추가
  koreanProviders.forEach(provider => {
    const alreadyExists = combinedProviders.some(p => p.name === provider.name);
    if (!alreadyExists) {
      combinedProviders.push({
        id: provider.name.toLowerCase().replace(/\s+/g, '-'),
        name: provider.name,
        logo: provider.logo,
        description: `${provider.name}에서 시청 가능합니다`,
        features: ['VOD 서비스', '다중 프로필', '오프라인 시청'],
        strengths: ['다양한 콘텐츠', '고품질 화질'],
        weaknesses: ['구독료 발생'],
        availableContent: [movieTitle]
      });
    }
  });
  
  return combinedProviders;
};

export const getOTTInfo = (ottId: string): OTTProvider | undefined => {
  const provider = KOREAN_OTT_PLATFORMS.find(ott => ott.name.toLowerCase().replace(/\s+/g, '-') === ottId);
  if (!provider) return undefined;
  
  return {
    id: provider.name.toLowerCase().replace(/\s+/g, '-'),
    name: provider.name,
    logo: provider.logo,
    description: `${provider.name}에서 다양한 콘텐츠를 시청할 수 있습니다`,
    features: ['VOD 서비스', '다중 프로필', '오프라인 시청'],
    strengths: ['다양한 콘텐츠', '고품질 화질'],
    weaknesses: ['구독료 발생'],
    availableContent: []
  };
};

export const getAllOTTs = (): OTTProvider[] => {
  return KOREAN_OTT_PLATFORMS.map(provider => ({
    id: provider.name.toLowerCase().replace(/\s+/g, '-'),
    name: provider.name,
    logo: provider.logo,
    description: `${provider.name}에서 다양한 콘텐츠를 시청할 수 있습니다`,
    features: ['VOD 서비스', '다중 프로필', '오프라인 시청'],
    strengths: ['다양한 콘텐츠', '고품질 화질'],
    weaknesses: ['구독료 발생'],
    availableContent: []
  }));
}; 