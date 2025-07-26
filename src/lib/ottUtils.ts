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

// OTT 정보를 숨겨야 하는 콘텐츠 필터링
const shouldHideOTTInfo = (movieTitle: string, genres?: string[], releaseDate?: string): boolean => {
  // 토크쇼 관련 키워드 체크
  const talkShowKeywords = ['토크쇼', 'talkshow', 'talk show', '인터뷰', 'interview'];
  const hasTalkShowKeyword = talkShowKeywords.some(keyword => 
    movieTitle.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 극장 상영중인 영화 체크 (최근 3개월 내 개봉)
  const isRecentlyReleased = releaseDate && (() => {
    const release = new Date(releaseDate);
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return release > threeMonthsAgo;
  })();
  
  // 해외 콘텐츠 체크 (한국어가 아닌 제목)
  const isForeignContent = !/[가-힣]/.test(movieTitle);
  
  return hasTalkShowKeyword || isRecentlyReleased || isForeignContent;
};

export const combineOTTData = (tmdbProviders: unknown, movieTitle: string, genres?: string[], releaseDate?: string): OTTProvider[] => {
  // OTT 정보를 숨겨야 하는 콘텐츠인지 체크
  if (shouldHideOTTInfo(movieTitle, genres, releaseDate)) {
    return [];
  }
  
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