

// 국내 OTT 정보 제공자
export interface KoreanOTTProvider {
  name: string;
  logo: string;
  url: string;
  available: boolean;
}

// 국내 OTT 플랫폼 목록
export const KOREAN_OTT_PLATFORMS: KoreanOTTProvider[] = [
  {
    name: '넷플릭스',
    logo: '/ott-logos/netflix.svg',
    url: 'https://www.netflix.com',
    available: true
  },
  {
    name: '디즈니플러스',
    logo: '/ott-logos/disney-plus.svg',
    url: 'https://www.disneyplus.com',
    available: true
  },
  {
    name: '웨이브',
    logo: '/ott-logos/wavve.svg',
    url: 'https://www.wavve.com',
    available: true
  },
  {
    name: '티빙',
    logo: '/ott-logos/tving.svg',
    url: 'https://www.tving.com',
    available: true
  },
  {
    name: '왓챠',
    logo: '/ott-logos/watcha.svg',
    url: 'https://www.watcha.com',
    available: true
  },
  {
    name: '라프텔',
    logo: '/ott-logos/laftel.svg',
    url: 'https://laftel.net',
    available: true
  },
  {
    name: '애플TV',
    logo: '/ott-logos/apple-tv.svg',
    url: 'https://tv.apple.com',
    available: true
  },
  {
    name: '아마존프라임',
    logo: '/ott-logos/amazon-prime.svg',
    url: 'https://www.primevideo.com',
    available: true
  }
];

// 한국어 콘텐츠 매핑 데이터베이스
export const KOREAN_CONTENT_DATABASE: Record<string, KoreanOTTProvider[]> = {
  // 예능
  '런닝맨': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '무한도전': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '1박2일': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '라디오스타': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '라디오 스타': [KOREAN_OTT_PLATFORMS[3]], // 티빙 (공백 포함)
  '개그콘서트': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '해피투게더': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '놀면뭐하니': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '신서유기': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '미운우리새끼': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  '동상이몽': [KOREAN_OTT_PLATFORMS[3]], // 티빙
  
  // 드라마
  '기생충': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '오징어게임': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '오징어 게임': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스 (공백 포함)
  '킹덤': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '스위트홈': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '지옥': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '더글로리': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '마스크걸': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '종이의집': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '사냥개들': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '마이데몬': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  
  // 영화
  '부산행': [KOREAN_OTT_PLATFORMS[0], KOREAN_OTT_PLATFORMS[2]], // 넷플릭스, 웨이브
  '옥자': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '마더': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '올드보이': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '괴물': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '살인의추억': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '친절한금자씨': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
  '아가씨': [KOREAN_OTT_PLATFORMS[0]], // 넷플릭스
};

// 한국어 콘텐츠 검색 함수
export function findKoreanOTTProviders(title: string): KoreanOTTProvider[] {
  const normalizedTitle = title.toLowerCase().replace(/[^\w\s가-힣]/g, '');
  
  // 개봉 예정/극장 상영 중인 영화들 제외 (한글 + 영문)
  const theaterOnlyMovies = [
    '메간 2.0', 'm3gan 2.0', 'megan 2.0',
    '슈퍼맨', 'superman', 'super man',
    '드래곤 길들이기', 'how to train your dragon',
    '판타스틱4', '판타스틱 4', '판타스틱', 'fantastic 4', 'fantastic four', 'fantastic4', 'fantastic',
    '극장판', 'theatrical', 'movie'
  ];
  
  for (const movie of theaterOnlyMovies) {
    if (normalizedTitle.includes(movie.toLowerCase())) {
      console.log('극장 전용 영화 필터링:', {
        originalTitle: title,
        normalizedTitle: normalizedTitle,
        matchedKeyword: movie,
        result: 'OTT 정보 제거됨'
      });
      return []; // 극장 전용 영화는 OTT 정보 없음
    }
  }
  
  // 정확한 매칭
  for (const [key, providers] of Object.entries(KOREAN_CONTENT_DATABASE)) {
    if (normalizedTitle.includes(key.toLowerCase())) {
      return providers;
    }
  }
  
  // 부분 매칭 (한국어 키워드)
  const koreanKeywords = ['런닝맨', '무한도전', '라디오스타', '개그콘서트', '해피투게더', '놀면뭐하니', '신서유기', '미운우리새끼', '동상이몽'];
  
  for (const keyword of koreanKeywords) {
    if (normalizedTitle.includes(keyword.toLowerCase())) {
      return [KOREAN_OTT_PLATFORMS[3]]; // 티빙 (예능 주로)
    }
  }
  
  // 한국어 콘텐츠 감지 (한글 포함) - 하지만 극장 전용 영화는 제외
  if (/[가-힣]/.test(title)) {
    // 정확한 매칭이 없는 경우 OTT 정보를 추가하지 않음
    return [];
  }
  
  return [];
}

// OTT 정보를 TMDB 결과와 결합하는 함수 (완화된 버전)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enhanceWithKoreanOTTInfo(tmdbResults: any[]): any[] {
  return tmdbResults.map(result => {
    const title = result.title || result.name || '';
    const koreanProviders = findKoreanOTTProviders(title);
    
    // 기존 TMDB OTT 정보가 있으면 유지, 없으면 한국 OTT 정보 추가
    if (!result.ott_providers && koreanProviders.length > 0) {
      const enhancedResult = {
        ...result,
        ott_providers: {
          KR: {
            flatrate: koreanProviders.map(provider => ({
              provider_id: Math.random(), // 임시 ID
              provider_name: provider.name,
              logo_path: provider.logo
            }))
          }
        }
      };
      return enhancedResult;
    }
    
    // TMDB OTT 정보가 있지만 KR이 없는 경우 한국 OTT 정보 추가
    if (result.ott_providers && !result.ott_providers.KR && koreanProviders.length > 0) {
      const enhancedResult = {
        ...result,
        ott_providers: {
          ...result.ott_providers,
          KR: {
            flatrate: koreanProviders.map(provider => ({
              provider_id: Math.random(), // 임시 ID
              provider_name: provider.name,
              logo_path: provider.logo
            }))
          }
        }
      };
      return enhancedResult;
    }
    
    // OTT 정보가 전혀 없는 경우 기본 구조 제공
    if (!result.ott_providers) {
      return {
        ...result,
        ott_providers: {
          KR: {
            flatrate: [],
            buy: [],
            rent: []
          }
        }
      };
    }
    
    return result;
  });
} 