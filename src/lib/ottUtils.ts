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
export function hasOTT(result: any): boolean {
  return !!(
    result.ott_providers &&
    result.ott_providers.KR &&
    Array.isArray(result.ott_providers.KR.flatrate) &&
    result.ott_providers.KR.flatrate.length > 0
  );
}

// 한국 OTT 정보가 있는지 체크하는 함수
export function hasKoreanOTT(result: any): boolean {
  return !!(
    result.korean_ott_providers &&
    Array.isArray(result.korean_ott_providers) &&
    result.korean_ott_providers.length > 0
  );
}

// TMDB 또는 한국 OTT 정보가 있는지 체크하는 함수
export function hasAnyOTT(result: any): boolean {
  return hasOTT(result) || hasKoreanOTT(result);
}

// OTT 정보가 있는 콘텐츠만 필터링하는 함수
export function filterByOTT(results: any[]): any[] {
  return results.filter(result => hasAnyOTT(result));
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