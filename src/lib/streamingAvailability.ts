// Streaming Availability API 클라이언트 - 한국 OTT 전용
export interface StreamingAvailabilityResult {
  results: Array<{
    id: string;
    title: string;
    name?: string;
    originalTitle?: string; // 영어 원제목
    type: 'movie' | 'series';
    year: number;
    posterPath?: string;
    posterURLs?: {
      original?: string;
      [key: string]: string | undefined;
    };
    overview?: string;
    overview_ko?: string; // 한국어 줄거리
    overview_en?: string; // 영어 줄거리
    streamingInfo?: {
      kr: {
        [service: string]: Array<{
          type: 'subscription' | 'rent' | 'buy';
          quality: string;
          audios: string[];
          subtitles: string[];
          leaving?: number;
          link?: string;
        }>;
      };
    };
  }>;
  total_pages: number;
  page: number;
}

export interface ShowDetail {
  id: string;
  title: string;
  name?: string;
  originalTitle?: string; // 영어 원제목
  type: 'movie' | 'series';
  year: number;
  posterPath?: string;
  posterURLs?: {
    original?: string;
    [key: string]: string | undefined;
  };
  overview?: string;
  overview_ko?: string; // 한국어 줄거리
  overview_en?: string; // 영어 줄거리
  streamingInfo?: {
    kr: {
      [service: string]: Array<{
        type: 'subscription' | 'rent' | 'buy';
        quality: string;
        audios: string[];
        subtitles: string[];
        leaving?: number;
        link?: string;
      }>;
    };
  };
  genres?: string[];
  cast?: string[];
  directors?: string[];
}

export class StreamingAvailabilityClient {
  private apiKey: string;
  private baseUrl = 'https://streaming-availability.p.rapidapi.com';

  constructor() {
    this.apiKey = process.env.STREAMING_AVAILABILITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Streaming Availability API 키가 설정되지 않았습니다.');
    }
  }

  // 1. OTT별 작품 리스트 조회 (페이징 포함)
  async fetchOTTMovies({ 
    country = 'kr', 
    service = 'netflix,watcha,wavve,tving,disney', 
    type = 'movie', 
    page = 1, 
    language = 'ko' 
  }: {
    country?: string;
    service?: string;
    type?: 'movie' | 'series';
    page?: number;
    language?: string;
  }): Promise<{
    results: StreamingAvailabilityResult['results'];
    totalPages: number;
    nextPage: number | null;
  }> {
    if (!this.apiKey) {
      console.log('API 키 없음 - 빈 결과 반환');
      return { results: [], totalPages: 1, nextPage: null };
    }

    try {
      // 여러 엔드포인트 시도
      let url: URL;
      
      // 1. 기본 검색 엔드포인트 시도
      url = new URL(`${this.baseUrl}/search/basic`);
      url.searchParams.set('country', country);
      url.searchParams.set('service', service);
      url.searchParams.set('type', type);
      url.searchParams.set('output_language', language);
      url.searchParams.set('page', page.toString());
      
      // 2. advanced 엔드포인트도 시도
      if (service.includes(',')) {
        url = new URL(`${this.baseUrl}/search/advanced`);
        url.searchParams.set('country', country);
        url.searchParams.set('service', service);
        url.searchParams.set('type', type);
        url.searchParams.set('output_language', language);
        url.searchParams.set('order_by', 'original_title');
        url.searchParams.set('page', page.toString());
      }

      console.log('=== API 호출 상세 정보 ===');
      console.log('최종 호출 URL:', url.toString());
      console.log('API 파라미터:', {
        country,
        service,
        type,
        language,
        page
      });
      console.log('API 키 길이:', this.apiKey.length);
      console.log('API 키 앞 10자리:', this.apiKey.substring(0, 10) + '...');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      console.log('API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 응답 에러 내용:', errorText);
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data: StreamingAvailabilityResult = await response.json();
      
      console.log(`OTT 영화 조회 결과: ${data.results?.length || 0}개, 페이지 ${data.page}/${data.total_pages}`);
      if (data.results && data.results.length > 0) {
        console.log('첫 번째 결과:', {
          id: data.results[0].id,
          title: data.results[0].title,
          type: data.results[0].type,
          year: data.results[0].year
        });
      }

      return {
        results: data.results || [],
        totalPages: data.total_pages || 1,
        nextPage: data.page < data.total_pages ? data.page + 1 : null
      };
    } catch (error) {
      console.error('OTT 영화 조회 실패:', error);
      return { results: [], totalPages: 1, nextPage: null };
    }
  }

  // 2. 단일 작품 상세정보 및 포스터, OTT 링크 가져오기
  async fetchShowDetail(showId: string, country = 'kr', language = 'ko'): Promise<ShowDetail | null> {
    if (!this.apiKey) {
      console.log('API 키 없음 - 상세정보 조회 불가');
      return null;
    }

    try {
      const url = new URL(`${this.baseUrl}/get/show`);
      url.searchParams.set('country', country);
      url.searchParams.set('show_id', encodeURIComponent(showId));
      url.searchParams.set('output_language', language);

      console.log('상세정보 API 호출:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`상세정보 API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('상세정보 조회 결과:', data.show?.title);
      
      return data.show || null;
    } catch (error) {
      console.error('상세정보 조회 실패:', error);
      return null;
    }
  }

  // 3. 제목으로 검색 (기존 메서드 개선)
  async searchByTitle(title: string): Promise<StreamingAvailabilityResult | null> {
    if (!this.apiKey) {
      console.log('API 키 없음 - 로컬 데이터 사용');
      return null;
    }

    try {
      const url = new URL(`${this.baseUrl}/search/title`);
      url.searchParams.set('title', title);
      url.searchParams.set('country', 'kr');
      url.searchParams.set('show_type', 'all');
      url.searchParams.set('output_language', 'ko');

      console.log('제목 검색 API 호출:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('제목 검색 결과:', data.result?.title);
      return data;
    } catch (error) {
      console.error('제목 검색 실패:', error);
      return null;
    }
  }

  // 4. 모든 한국 OTT에서 스트리밍되는 콘텐츠 조회
  async fetchAllKoreanOTTContent(page = 1): Promise<{
    results: StreamingAvailabilityResult['results'];
    totalPages: number;
    nextPage: number | null;
  }> {
    return this.fetchOTTMovies({
      country: 'kr',
      service: 'netflix,watcha,wavve,tving,disney,laftel,apple,amazon',
      type: 'movie',
      page,
      language: 'ko'
    });
  }

  // 5. 특정 OTT 서비스의 콘텐츠만 조회
  async fetchSpecificOTTContent(service: string, type: 'movie' | 'series' = 'movie', page = 1): Promise<{
    results: StreamingAvailabilityResult['results'];
    totalPages: number;
    nextPage: number | null;
  }> {
    return this.fetchOTTMovies({
      country: 'kr',
      service,
      type,
      page,
      language: 'ko'
    });
  }

  // 6. Streaming Availability 결과를 OTT 제공업체 형식으로 변환 (개선)
  convertToOTTProviders(streamingData: StreamingAvailabilityResult | null) {
    if (!streamingData || !streamingData.results || streamingData.results.length === 0) {
      return null;
    }

    const ottProviders: {
      KR: {
        flatrate: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
        buy: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
        rent: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      };
    } = {
      KR: {
        flatrate: [],
        buy: [],
        rent: []
      }
    };

    // 첫 번째 결과의 스트리밍 서비스 정보 추출
    const firstResult = streamingData.results[0];
    if (firstResult.streamingInfo?.kr) {
      for (const [service, serviceInfo] of Object.entries(firstResult.streamingInfo.kr)) {
        if (Array.isArray(serviceInfo) && serviceInfo.length > 0) {
          const providerInfo = {
            provider_id: this.getProviderId(service),
            provider_name: this.getProviderName(service),
            logo_path: this.getProviderLogo(service)
          };

          // 각 서비스의 타입에 따라 분류
          serviceInfo.forEach(info => {
            if (info.type === 'subscription') {
              ottProviders.KR.flatrate.push(providerInfo);
            } else if (info.type === 'rent') {
              ottProviders.KR.rent.push(providerInfo);
            } else if (info.type === 'buy') {
              ottProviders.KR.buy.push(providerInfo);
            }
          });
        }
      }
    }

    return ottProviders;
  }

  // 7. 결과 배열을 OTT 제공업체 형식으로 변환 (새로운 메서드)
  convertResultsToOTTProviders(results: StreamingAvailabilityResult['results']) {
    const ottProviders: {
      KR: {
        flatrate: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
        buy: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
        rent: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      };
    } = {
      KR: {
        flatrate: [],
        buy: [],
        rent: []
      }
    };

    results.forEach(result => {
      if (result.streamingInfo?.kr) {
        for (const [service, serviceInfo] of Object.entries(result.streamingInfo.kr)) {
          if (Array.isArray(serviceInfo) && serviceInfo.length > 0) {
            const providerInfo = {
              provider_id: this.getProviderId(service),
              provider_name: this.getProviderName(service),
              logo_path: this.getProviderLogo(service)
            };

            serviceInfo.forEach(info => {
              if (info.type === 'subscription') {
                ottProviders.KR.flatrate.push(providerInfo);
              } else if (info.type === 'rent') {
                ottProviders.KR.rent.push(providerInfo);
              } else if (info.type === 'buy') {
                ottProviders.KR.buy.push(providerInfo);
              }
            });
          }
        }
      }
    });

    return ottProviders;
  }

  // 8. 한글 메타데이터 fallback 처리
  processKoreanMetadata(item: StreamingAvailabilityResult['results'][0] | ShowDetail) {
    // 제목 fallback: 한국어 → 영어 원제목 → 영어 제목
    const processedTitle = item.title || item.originalTitle || item.name || '제목 없음';
    
    // 줄거리 fallback: 한국어 → 영어
    const processedOverview = item.overview_ko || item.overview_en || item.overview || '';
    
    return {
      ...item,
      title: processedTitle,
      overview: processedOverview,
      // 한글 제목이 없으면 영어 제목도 함께 표시
      displayTitle: item.title ? item.title : 
                   item.originalTitle ? `${item.originalTitle} (${item.originalTitle})` : 
                   item.name || '제목 없음'
    };
  }

  // 9. 결과 배열의 메타데이터를 한글 우선으로 처리
  processKoreanMetadataForResults(results: StreamingAvailabilityResult['results']) {
    return results.map(item => this.processKoreanMetadata(item));
  }

  // 10. 한국어 메타데이터가 있는지 확인
  hasKoreanMetadata(item: StreamingAvailabilityResult['results'][0] | ShowDetail): boolean {
    return !!(item.title || item.overview_ko);
  }

  // 11. 영어 fallback이 필요한지 확인
  needsEnglishFallback(item: StreamingAvailabilityResult['results'][0] | ShowDetail): boolean {
    return !this.hasKoreanMetadata(item) && !!(item.originalTitle || item.overview_en);
  }

  private getProviderId(service: string): number {
    const providerIds: Record<string, number> = {
      'netflix': 8,
      'disney': 2,
      'wavve': 97,
      'tving': 98,
      'watcha': 99,
      'laftel': 100,
      'apple': 2,
      'amazon': 9
    };
    return providerIds[service] || Math.random();
  }

  private getProviderName(service: string): string {
    const providerNames: Record<string, string> = {
      'netflix': '넷플릭스',
      'disney': '디즈니플러스',
      'wavve': '웨이브',
      'tving': '티빙',
      'watcha': '왓챠',
      'laftel': '라프텔',
      'apple': '애플TV',
      'amazon': '아마존프라임'
    };
    return providerNames[service] || service;
  }

  private getProviderLogo(service: string): string {
    return `/ott-logos/${service.toLowerCase().replace(/\s+/g, '-')}.svg`;
  }
}

export const streamingAvailabilityClient = new StreamingAvailabilityClient(); 