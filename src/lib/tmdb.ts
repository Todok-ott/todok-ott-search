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

// TMDB 검색 결과 정규화를 위한 인터페이스
export interface TMDBRawItem {
  id: number;
  title?: string;
  name?: string;
  media_type?: 'movie' | 'tv' | 'person';
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  [key: string]: unknown;
}

// 정규화된 콘텐츠 타입
export interface NormalizedContent {
  id: number;
  title: string;
  name?: string; // TV 쇼의 경우 name도 유지
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  ott_providers?: {
    flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
  };
}

class TMDBClient {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

  // TMDB 검색 결과 정규화 함수
  normalizeTMDBItem(item: TMDBRawItem): NormalizedContent | null {
    try {
      // media_type이 movie나 tv가 아니면 제외
      if (!item.media_type || (item.media_type !== 'movie' && item.media_type !== 'tv')) {
        console.log('제외된 항목 (media_type):', item.media_type, item);
        return null;
      }

      // 필수 필드 검증
      if (!item.id) {
        console.error('ID가 없는 항목:', item);
        return null;
      }

      // 제목 필드 정규화 (movie는 title, tv는 name)
      const title = item.media_type === 'movie' ? item.title : item.name;
      if (!title) {
        console.error('제목이 없는 항목:', item);
        return null;
      }

      // 기본값 설정
      const normalized: NormalizedContent = {
        id: item.id,
        title: title,
        name: item.media_type === 'tv' ? item.name : undefined, // TV 쇼의 경우 name 유지
        overview: item.overview || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        vote_average: item.vote_average || 0,
        vote_count: item.vote_count || 0,
        media_type: item.media_type,
        genre_ids: item.genre_ids || [],
        ott_providers: undefined
      };

      console.log('정규화된 항목:', {
        id: normalized.id,
        title: normalized.title,
        name: normalized.name,
        media_type: normalized.media_type
      });

      return normalized;
    } catch (error) {
      console.error('항목 정규화 실패:', error, item);
      return null;
    }
  }

  // 검색 결과 필터링 및 정규화
  normalizeSearchResults(results: TMDBRawItem[]): NormalizedContent[] {
    console.log('검색 결과 정규화 시작:', results.length);
    
    const normalized = results
      .map(item => this.normalizeTMDBItem(item))
      .filter((item): item is NormalizedContent => item !== null);
    
    console.log('정규화 완료:', normalized.length);
    return normalized;
  }

  // media_type에 따른 상세 정보 가져오기
  async getContentDetails(id: number, mediaType: 'movie' | 'tv'): Promise<unknown> {
    try {
      if (mediaType === 'movie') {
        return await this.getMovieDetails(id);
      } else if (mediaType === 'tv') {
        return await this.getTVDetails(id);
      } else {
        throw new Error(`지원하지 않는 media_type: ${mediaType}`);
      }
    } catch (error) {
      console.error(`${mediaType} 상세 정보 가져오기 실패 (ID: ${id}):`, error);
      throw error;
    }
  }

  // media_type에 따른 OTT 정보 가져오기
  async getContentWatchProviders(id: number, mediaType: 'movie' | 'tv'): Promise<unknown> {
    try {
      if (mediaType === 'movie') {
        return await this.getMovieWatchProviders(id);
      } else if (mediaType === 'tv') {
        return await this.getTVWatchProviders(id);
      } else {
        throw new Error(`지원하지 않는 media_type: ${mediaType}`);
      }
    } catch (error) {
      console.error(`${mediaType} OTT 정보 가져오기 실패 (ID: ${id}):`, error);
      throw error;
    }
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
        
        // 재시도 로직 (최대 3회)
        if (retryCount < 3 && (response.status === 429 || response.status >= 500)) {
          console.log(`재시도 ${retryCount + 1}/3...`);
          await this.delay(1000 * (retryCount + 1)); // 지수 백오프
          return this.fetchAPI(endpoint, params, retryCount + 1);
        }
        
        throw new Error(`TMDB API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
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

  // 검색 기능 (정규화된 결과 반환)
  async searchMulti(query: string, page: number = 1): Promise<{ results: NormalizedContent[]; total_pages: number; total_results: number }> {
    try {
      const rawResult = await this.fetchAPI<{ results: TMDBRawItem[]; total_pages: number; total_results: number }>('/search/multi', { 
        query, 
        page: page.toString(),
        include_adult: 'false'
      });
      
      const normalizedResults = this.normalizeSearchResults(rawResult.results || []);
      
      return {
        results: normalizedResults,
        total_pages: rawResult.total_pages,
        total_results: normalizedResults.length
      };
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
  async getMovieDetails(id: number): Promise<unknown> {
    try {
      return await this.fetchAPI(`/movie/${id}`, {
        append_to_response: 'credits,videos,similar'
      });
    } catch (error) {
      console.error('영화 상세 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // TV 쇼 상세 정보
  async getTVDetails(id: number): Promise<unknown> {
    try {
      return await this.fetchAPI(`/tv/${id}`, {
        append_to_response: 'credits,videos,similar'
      });
    } catch (error) {
      console.error('TV 쇼 상세 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // 영화 Watch Provider 정보 (OTT 플랫폼)
  async getMovieWatchProviders(id: number): Promise<unknown> {
    try {
      return await this.fetchAPI(`/movie/${id}/watch/providers`);
    } catch (error) {
      console.error('영화 OTT 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // TV 쇼 Watch Provider 정보 (OTT 플랫폼)
  async getTVWatchProviders(id: number): Promise<unknown> {
    try {
      return await this.fetchAPI(`/tv/${id}/watch/providers`);
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