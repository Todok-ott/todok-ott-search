// TMDB API 키 설정
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '4ac15bcba7db3269d7674467f5f70168';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

  private async fetchAPI(endpoint: string, params: Record<string, string> = {}) {
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
      return cached.data;
    }

    // API 요청 제한 준수 (초당 50회 미만)
    await this.delay(20); // 20ms 딜레이로 초당 최대 50회 요청

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 캐시에 저장
    this.cache.set(cacheKey, { data, timestamp: now });
    
    return data;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 인기 영화 가져오기
  async getPopularMovies(page: number = 1): Promise<SearchResult> {
    return this.fetchAPI('/movie/popular', { page: page.toString() });
  }

  // 인기 TV 쇼 가져오기
  async getPopularTVShows(page: number = 1): Promise<SearchResult> {
    return this.fetchAPI('/tv/popular', { page: page.toString() });
  }

  // Trending 콘텐츠 가져오기 (영화 + TV)
  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<SearchResult> {
    return this.fetchAPI('/trending/all/week', { time_window: timeWindow });
  }

  // 검색 기능
  async searchMulti(query: string, page: number = 1): Promise<SearchResult> {
    return this.fetchAPI('/search/multi', { 
      query, 
      page: page.toString(),
      include_adult: 'false'
    });
  }

  // 영화 상세 정보
  async getMovieDetails(id: number): Promise<any> {
    return this.fetchAPI(`/movie/${id}`, {
      append_to_response: 'credits,videos,similar'
    });
  }

  // TV 쇼 상세 정보
  async getTVDetails(id: number): Promise<any> {
    return this.fetchAPI(`/tv/${id}`, {
      append_to_response: 'credits,videos,similar'
    });
  }

  // 영화 Watch Provider 정보 (OTT 플랫폼)
  async getMovieWatchProviders(id: number): Promise<any> {
    return this.fetchAPI(`/movie/${id}/watch/providers`);
  }

  // TV 쇼 Watch Provider 정보 (OTT 플랫폼)
  async getTVWatchProviders(id: number): Promise<any> {
    return this.fetchAPI(`/tv/${id}/watch/providers`);
  }

  // 장르 목록 가져오기
  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchAPI('/genre/movie/list');
  }

  // 이미지 URL 생성
  getImageUrl(path: string, size: 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-poster.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbClient = new TMDBClient(); 