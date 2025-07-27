// TMDB API 키 설정
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '4ac15bcba7db3269d7674467f5f70168';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// API 키 유효성 검사
if (!TMDB_API_KEY || TMDB_API_KEY === 'undefined') {
  console.error('TMDB API 키가 설정되지 않았습니다.');
}

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
  ott_providers?: {
    flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
  };
}

export interface SearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

class TMDBClient {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

  // ID 유효성 검사 함수
  private validateId(id: string | number): number {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId) || numId <= 0) {
      throw new Error('유효하지 않은 콘텐츠 ID입니다.');
    }
    return numId;
  }

  // 응답 데이터 ID 검증 함수
  private validateResponseId(response: unknown, expectedId: number): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }
    
    const responseObj = response as Record<string, unknown>;
    const responseId = responseObj.id;
    
    if (typeof responseId !== 'number') {
      return false;
    }
    
    return responseId === expectedId;
  }

  private async fetchAPI<T>(endpoint: string, params: Record<string, string> = {}, retryCount = 0): Promise<T> {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'undefined') {
      throw new Error('TMDB API 키가 설정되지 않았습니다.');
    }

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('language', 'ko-KR');
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const cacheKey = url.toString();
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    // 캐시된 데이터가 있고 유효한 경우
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data as T;
    }

    // API 요청 제한 준수 (초당 50회 미만)
    await this.delay(20); // 20ms 딜레이로 초당 최대 50회 요청

    console.log('TMDB API 요청:', url.toString());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃으로 증가

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('TMDB API 응답 오류:', response.status, response.statusText);
        
        // 404 오류 처리 (콘텐츠를 찾을 수 없음)
        if (response.status === 404) {
          throw new Error('요청한 콘텐츠를 찾을 수 없습니다.');
        }
        
        // 재시도 로직 (최대 3회)
        if (retryCount < 3 && (response.status === 429 || response.status >= 500)) {
          console.log(`재시도 ${retryCount + 1}/3...`);
          await this.delay(1000 * (retryCount + 1)); // 지수 백오프
          return this.fetchAPI(endpoint, params, retryCount + 1);
        }
        
        throw new Error(`TMDB API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 응답 데이터 유효성 검사
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        throw new Error('TMDB API에서 유효하지 않은 데이터를 받았습니다.');
      }
      
      // 캐시에 저장
      this.cache.set(cacheKey, { data, timestamp: now });
      
      return data as T;
    } catch (error) {
      console.error('TMDB API 요청 실패:', error);
      
      // 재시도 로직 (네트워크 오류나 타임아웃의 경우)
      if (retryCount < 3 && (error instanceof Error && 
          (error.name === 'AbortError' || error.message.includes('fetch')))) {
        console.log(`네트워크 오류로 재시도 ${retryCount + 1}/3...`);
        await this.delay(2000 * (retryCount + 1)); // 지수 백오프
        return this.fetchAPI(endpoint, params, retryCount + 1);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('TMDB API 요청 시간 초과');
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 캐시 클리어 함수
  clearCache(): void {
    this.cache.clear();
    console.log('TMDB 캐시가 클리어되었습니다.');
  }

  // 특정 ID의 캐시 무효화
  invalidateCacheForId(id: number, mediaType: 'movie' | 'tv'): void {
    const patterns = [
      `/movie/${id}`,
      `/tv/${id}`,
      `/movie/${id}/watch/providers`,
      `/tv/${id}/watch/providers`
    ];
    
    for (const [key] of this.cache) {
      if (patterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
        console.log(`캐시 무효화: ${key}`);
      }
    }
  }

  // 인기 영화 가져오기
  async getPopularMovies(page: number = 1): Promise<SearchResult> {
    try {
      return await this.fetchAPI('/movie/popular', { page: page.toString() });
    } catch (error) {
      console.error('인기 영화 가져오기 실패:', error);
      throw error;
    }
  }

  // 인기 TV 쇼 가져오기
  async getPopularTVShows(page: number = 1): Promise<SearchResult> {
    try {
      return await this.fetchAPI('/tv/popular', { page: page.toString() });
    } catch (error) {
      console.error('인기 TV 쇼 가져오기 실패:', error);
      throw error;
    }
  }

  // Trending 콘텐츠 가져오기 (영화 + TV)
  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<SearchResult> {
    try {
      return await this.fetchAPI('/trending/all/week', { time_window: timeWindow });
    } catch (error) {
      console.error('Trending 콘텐츠 가져오기 실패:', error);
      throw error;
    }
  }

  // 검색 기능
  async searchMulti(query: string, page: number = 1): Promise<SearchResult> {
    try {
      return await this.fetchAPI('/search/multi', { 
        query, 
        page: page.toString(),
        include_adult: 'false'
      });
    } catch (error) {
      console.error('검색 실패:', error);
      throw error;
    }
  }

  // 영화 검색
  async searchMovies(query: string, page: number = 1): Promise<SearchResult> {
    try {
      return await this.fetchAPI('/search/movie', { 
        query, 
        page: page.toString(),
        include_adult: 'false'
      });
    } catch (error) {
      console.error('영화 검색 실패:', error);
      throw error;
    }
  }

  // TV 쇼 검색
  async searchTV(query: string, page: number = 1): Promise<SearchResult> {
    try {
      return await this.fetchAPI('/search/tv', { 
        query, 
        page: page.toString(),
        include_adult: 'false'
      });
    } catch (error) {
      console.error('TV 쇼 검색 실패:', error);
      throw error;
    }
  }

  // 영화 상세 정보
  async getMovieDetails(id: string | number): Promise<unknown> {
    try {
      const validatedId = this.validateId(id);
      console.log(`영화 상세 정보 요청: ID ${validatedId}`);
      
      // 캐시 무효화 (잘못된 데이터 방지)
      this.invalidateCacheForId(validatedId, 'movie');
      
      const result = await this.fetchAPI(`/movie/${validatedId}`, {
        append_to_response: 'credits,videos,similar'
      });
      
      // 응답 ID 검증
      if (!this.validateResponseId(result, validatedId)) {
        console.error(`ID 불일치: 요청 ${validatedId}, 응답 ${(result as any)?.id}`);
        throw new Error('요청한 ID와 응답 ID가 일치하지 않습니다.');
      }
      
      console.log(`영화 상세 정보 완료: ID ${validatedId} - ${(result as any)?.title || (result as any)?.name}`);
      return result;
    } catch (error) {
      console.error('영화 상세 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // TV 쇼 상세 정보
  async getTVDetails(id: string | number): Promise<unknown> {
    try {
      const validatedId = this.validateId(id);
      console.log(`TV 쇼 상세 정보 요청: ID ${validatedId}`);
      
      // 캐시 무효화 (잘못된 데이터 방지)
      this.invalidateCacheForId(validatedId, 'tv');
      
      const result = await this.fetchAPI(`/tv/${validatedId}`, {
        append_to_response: 'credits,videos,similar'
      });
      
      // 응답 ID 검증
      if (!this.validateResponseId(result, validatedId)) {
        console.error(`ID 불일치: 요청 ${validatedId}, 응답 ${(result as any)?.id}`);
        throw new Error('요청한 ID와 응답 ID가 일치하지 않습니다.');
      }
      
      console.log(`TV 쇼 상세 정보 완료: ID ${validatedId} - ${(result as any)?.title || (result as any)?.name}`);
      return result;
    } catch (error) {
      console.error('TV 쇼 상세 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // 영화 Watch Provider 정보 (OTT 플랫폼)
  async getMovieWatchProviders(id: string | number): Promise<unknown> {
    try {
      const validatedId = this.validateId(id);
      return await this.fetchAPI(`/movie/${validatedId}/watch/providers`);
    } catch (error) {
      console.error('영화 OTT 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // TV 쇼 Watch Provider 정보 (OTT 플랫폼)
  async getTVWatchProviders(id: string | number): Promise<unknown> {
    try {
      const validatedId = this.validateId(id);
      return await this.fetchAPI(`/tv/${validatedId}/watch/providers`);
    } catch (error) {
      console.error('TV 쇼 OTT 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // 장르 목록 가져오기
  async getGenres(): Promise<{ genres: Genre[] }> {
    try {
      return await this.fetchAPI('/genre/movie/list');
    } catch (error) {
      console.error('장르 목록 가져오기 실패:', error);
      throw error;
    }
  }

  // 이미지 URL 생성
  getImageUrl(path: string, size: 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-poster.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbClient = new TMDBClient(); 