import { TMDB_API_KEY } from './tmdb';

interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  ott_services?: string[];
}

interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  ott_services?: string[];
}

interface SearchResponse {
  page: number;
  results: Movie[] | TVShow[];
  total_pages: number;
  total_results: number;
}

class TMDBWithOTTClient {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
  }

  // 한국 OTT 서비스 정보 (수동 데이터)
  private koreanOTTServices = {
    netflix: {
      name: 'Netflix',
      logo: '/ott-logos/netflix.svg',
      supported: true
    },
    watcha: {
      name: 'Watcha',
      logo: '/ott-logos/watcha.svg',
      supported: true
    },
    tving: {
      name: 'Tving',
      logo: '/ott-logos/tving.svg',
      supported: true
    },
    wavve: {
      name: 'Wavve',
      logo: '/ott-logos/wavve.svg',
      supported: true
    },
    disney: {
      name: 'Disney+',
      logo: '/ott-logos/disney-plus.svg',
      supported: true
    },
    apple: {
      name: 'Apple TV+',
      logo: '/ott-logos/apple-tv.svg',
      supported: true
    },
    prime: {
      name: 'Amazon Prime',
      logo: '/ott-logos/amazon-prime.svg',
      supported: true
    }
  };

  // 인기 영화 가져오기 (한국 OTT 정보 포함)
  async getPopularMovies(page: number = 1): Promise<SearchResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=ko-KR&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API 오류: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      // 한국 OTT 정보 추가 (시뮬레이션)
      const moviesWithOTT = data.results.map((movie: Movie) => ({
        ...movie,
        ott_services: this.getRandomOTTServices()
      }));

      return {
        ...data,
        results: moviesWithOTT
      };

    } catch (error) {
      console.error('인기 영화 가져오기 실패:', error);
      throw error;
    }
  }

  // 인기 TV 시리즈 가져오기 (한국 OTT 정보 포함)
  async getPopularTVShows(page: number = 1): Promise<SearchResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&language=ko-KR&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API 오류: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      // 한국 OTT 정보 추가 (시뮬레이션)
      const showsWithOTT = data.results.map((show: TVShow) => ({
        ...show,
        ott_services: this.getRandomOTTServices()
      }));

      return {
        ...data,
        results: showsWithOTT
      };

    } catch (error) {
      console.error('인기 TV 시리즈 가져오기 실패:', error);
      throw error;
    }
  }

  // 영화 검색 (한국 OTT 정보 포함)
  async searchMovies(query: string, page: number = 1): Promise<SearchResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=ko-KR&query=${encodeURIComponent(query)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API 오류: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      // 한국 OTT 정보 추가 (시뮬레이션)
      const moviesWithOTT = data.results.map((movie: Movie) => ({
        ...movie,
        ott_services: this.getRandomOTTServices()
      }));

      return {
        ...data,
        results: moviesWithOTT
      };

    } catch (error) {
      console.error('영화 검색 실패:', error);
      throw error;
    }
  }

  // TV 시리즈 검색 (한국 OTT 정보 포함)
  async searchTVShows(query: string, page: number = 1): Promise<SearchResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/tv?api_key=${this.apiKey}&language=ko-KR&query=${encodeURIComponent(query)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API 오류: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      // 한국 OTT 정보 추가 (시뮬레이션)
      const showsWithOTT = data.results.map((show: TVShow) => ({
        ...show,
        ott_services: this.getRandomOTTServices()
      }));

      return {
        ...data,
        results: showsWithOTT
      };

    } catch (error) {
      console.error('TV 시리즈 검색 실패:', error);
      throw error;
    }
  }

  // 영화 상세 정보 가져오기
  async getMovieDetails(movieId: number): Promise<Movie> {
    try {
      const response = await fetch(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=ko-KR`
      );

      if (!response.ok) {
        throw new Error(`TMDB API 오류: ${response.status}`);
      }

      const movie: Movie = await response.json();
      
      return {
        ...movie,
        ott_services: this.getRandomOTTServices()
      };

    } catch (error) {
      console.error('영화 상세 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // TV 시리즈 상세 정보 가져오기
  async getTVShowDetails(showId: number): Promise<TVShow> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tv/${showId}?api_key=${this.apiKey}&language=ko-KR`
      );

      if (!response.ok) {
        throw new Error(`TMDB API 오류: ${response.status}`);
      }

      const show: TVShow = await response.json();
      
      return {
        ...show,
        ott_services: this.getRandomOTTServices()
      };

    } catch (error) {
      console.error('TV 시리즈 상세 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // 랜덤 OTT 서비스 생성 (시뮬레이션)
  private getRandomOTTServices(): string[] {
    const services = Object.keys(this.koreanOTTServices);
    const numServices = Math.floor(Math.random() * 4) + 1; // 1-4개 서비스
    const selectedServices: string[] = [];
    
    for (let i = 0; i < numServices; i++) {
      const randomService = services[Math.floor(Math.random() * services.length)];
      if (!selectedServices.includes(randomService)) {
        selectedServices.push(randomService);
      }
    }
    
    return selectedServices;
  }

  // 한국 OTT 서비스 정보 가져오기
  getKoreanOTTServices() {
    return this.koreanOTTServices;
  }
}

export const tmdbWithOTTClient = new TMDBWithOTTClient();
export type { Movie, TVShow, SearchResponse }; 