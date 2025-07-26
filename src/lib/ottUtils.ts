import { koreanOTTs, recentTheaterMovies, streamingAvailableMovies } from './koreanOTTs';

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

export const combineOTTData = (tmdbProviders: unknown, movieTitle: string): OTTProvider[] => {
  const combinedProviders: OTTProvider[] = [];
  
  // 최신 개봉 영화인지 확인
  const isRecentTheaterMovie = recentTheaterMovies.some(title => 
    movieTitle.toLowerCase().includes(title.toLowerCase())
  );
  
  // 스트리밍 가능한 영화인지 확인
  const isStreamingAvailable = streamingAvailableMovies.some(title => 
    movieTitle.toLowerCase().includes(title.toLowerCase())
  );
  
  // 최신 개봉 영화라면 스트리밍 불가능 메시지만 표시
  if (isRecentTheaterMovie) {
    return [{
      id: 'theater-only',
      name: '극장 상영',
      logo: '/ott-logos/theater.svg',
      description: '현재 극장에서만 상영 중입니다',
      features: ['극장에서만 관람 가능'],
      strengths: ['최신 영화', '최고 화질'],
      weaknesses: ['스트리밍 불가', '가격이 비쌈'],
      availableContent: []
    }];
  }
  
  // 스트리밍 가능한 영화가 아니라면 아무것도 표시하지 않음
  if (!isStreamingAvailable) {
    return [];
  }
  
  // TMDB 데이터 처리
  if (tmdbProviders && typeof tmdbProviders === 'object' && 'results' in tmdbProviders) {
    const providers = tmdbProviders as { results?: { KR?: unknown } };
    if (providers.results?.KR && Array.isArray(providers.results.KR)) {
      providers.results.KR.forEach((provider: unknown) => {
        if (provider && typeof provider === 'object' && 'provider_name' in provider) {
          const providerData = provider as { provider_name: string; provider_id: number };
          const koreanOTT = koreanOTTs.find(ott => 
            ott.name.toLowerCase().includes(providerData.provider_name.toLowerCase()) ||
            providerData.provider_name.toLowerCase().includes(ott.name.toLowerCase())
          );
          
          if (koreanOTT) {
            combinedProviders.push({
              ...koreanOTT,
              id: koreanOTT.id,
              name: koreanOTT.name,
              logo: koreanOTT.logo,
              description: koreanOTT.description,
              features: koreanOTT.features,
              strengths: koreanOTT.strengths,
              weaknesses: koreanOTT.weaknesses,
              availableContent: koreanOTT.availableContent
            });
          }
        }
      });
    }
  }
  
  // 한국 OTT 중에서 해당 영화를 제공하는 서비스 추가
  koreanOTTs.forEach(ott => {
    if (ott.availableContent.some(content => 
      movieTitle.toLowerCase().includes(content.toLowerCase()) ||
      content.toLowerCase().includes(movieTitle.toLowerCase())
    )) {
      const alreadyExists = combinedProviders.some(p => p.id === ott.id);
      if (!alreadyExists) {
        combinedProviders.push({
          ...ott,
          id: ott.id,
          name: ott.name,
          logo: ott.logo,
          description: ott.description,
          features: ott.features,
          strengths: ott.strengths,
          weaknesses: ott.weaknesses,
          availableContent: ott.availableContent
        });
      }
    }
  });
  
  return combinedProviders;
};

export const getOTTInfo = (ottId: string): OTTProvider | undefined => {
  return koreanOTTs.find(ott => ott.id === ottId);
};

export const getAllOTTs = (): OTTProvider[] => {
  return koreanOTTs;
}; 