// 한국 OTT 플랫폼 정보
const KOREAN_OTT_PLATFORMS = [
  { name: '넷플릭스', logo: '/ott-logos/netflix.svg' },
  { name: '디즈니플러스', logo: '/ott-logos/disney-plus.svg' },
  { name: '웨이브', logo: '/ott-logos/wavve.svg' },
  { name: '티빙', logo: '/ott-logos/tving.svg' },
  { name: '왓챠', logo: '/ott-logos/watcha.svg' },
  { name: '라프텔', logo: '/ott-logos/laftel.svg' },
  { name: '애플TV', logo: '/ott-logos/apple-tv.svg' },
  { name: '아마존프라임', logo: '/ott-logos/amazon-prime.svg' }
];

// 한국 OTT 제공업체 찾기 함수
function findKoreanOTTProviders(title: string): Array<{ name: string; logo: string }> {
  const providers: Array<{ name: string; logo: string }> = [];
  
  // 간단한 키워드 매칭 (실제로는 더 정교한 로직이 필요)
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('기생충') || lowerTitle.includes('parasite')) {
    providers.push({ name: '넷플릭스', logo: '/ott-logos/netflix.svg' });
    providers.push({ name: '티빙', logo: '/ott-logos/tving.svg' });
  }
  
  if (lowerTitle.includes('오징어') || lowerTitle.includes('squid')) {
    providers.push({ name: '넷플릭스', logo: '/ott-logos/netflix.svg' });
  }
  
  return providers;
}

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

// OTT 정보가 있는지 체크하는 재사용 함수 (완화된 버전)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasOTT(result: any): boolean {
  // 1. 로컬 데이터의 ottPlatforms 배열 체크
  if (result.ottPlatforms && Array.isArray(result.ottPlatforms) && result.ottPlatforms.length > 0) {
    return true;
  }

  // 2. ott_providers 구조 체크 (대폭 완화)
  if (result.ott_providers) {
    // 모든 국가 코드에서 flatrate, buy, rent 중 하나라도 있으면 통과
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

// OTT 정보가 있는지 체크하는 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasAnyOTT(result: any): boolean {
  return hasOTT(result) || hasKoreanOTT(result);
}

// OTT 정보가 있는 콘텐츠만 필터링하는 함수 (활성화된 버전)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterByOTT(results: any[]): any[] {
  console.log('OTT 필터링 활성화 - 필터링 전 결과 수:', results.length);
  const filteredResults = results.filter(result => hasAnyOTT(result));
  console.log('OTT 필터링 후 결과 수:', filteredResults.length);
  return filteredResults;
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
    for (const country in result.ott_providers) {
      console.log(`${country} 구조:`, result.ott_providers[country]);
    }
  }
  
  console.log('hasOTT 결과:', hasOTT(result));
  console.log('hasAnyOTT 결과:', hasAnyOTT(result));
  console.log('=====================');
}

export const combineOTTData = (ottProviders: unknown, movieTitle: string): OTTProvider[] => {
  const combinedProviders: OTTProvider[] = [];
  
  // 한국 OTT 정보 확인
  const koreanProviders = findKoreanOTTProviders(movieTitle);
  
  // Streaming Availability 데이터 처리
  if (ottProviders && typeof ottProviders === 'object' && 'results' in ottProviders) {
    const providers = ottProviders as { results?: { KR?: unknown } };
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