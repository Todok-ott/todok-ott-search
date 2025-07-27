// Streaming Availability API 클라이언트
export interface StreamingAvailabilityResult {
  result: {
    type: 'movie' | 'show';
    title: string;
    year: number;
    streamingInfo: {
      [service: string]: {
        kr: {
          type: 'subscription' | 'rent' | 'buy';
          quality: string;
          audios: string[];
          subtitles: string[];
          leaving: number;
        };
      };
    };
  };
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

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('Streaming Availability API 결과:', data);
      return data;
    } catch (error) {
      console.error('Streaming Availability API 오류:', error);
      return null;
    }
  }

  async getMovieDetails(imdbId: string) {
    if (!this.apiKey) return null;

    try {
      const url = new URL(`${this.baseUrl}/get/details`);
      url.searchParams.set('imdb_id', imdbId);
      url.searchParams.set('country', 'kr');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('영화 상세 정보 가져오기 실패:', error);
      return null;
    }
  }

  // Streaming Availability 결과를 OTT 제공업체 형식으로 변환
  convertToOTTProviders(streamingData: StreamingAvailabilityResult | null) {
    if (!streamingData || !streamingData.result) {
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

    // 스트리밍 서비스 정보 추출
    if (streamingData.result.streamingInfo) {
      for (const [service, info] of Object.entries(streamingData.result.streamingInfo)) {
        if (info.kr) {
          const serviceInfo = {
            provider_id: this.getProviderId(service),
            provider_name: this.getProviderName(service),
            logo_path: this.getProviderLogo(service)
          };

          // 스트리밍 타입에 따라 분류
          if (info.kr.type === 'subscription') {
            ottProviders.KR.flatrate.push(serviceInfo);
          } else if (info.kr.type === 'rent') {
            ottProviders.KR.rent.push(serviceInfo);
          } else if (info.kr.type === 'buy') {
            ottProviders.KR.buy.push(serviceInfo);
          }
        }
      }
    }

    return ottProviders;
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