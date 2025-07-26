import movieData from '@/data/movies.json';

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  type: 'movie' | 'drama';
  year: number;
  rating: number;
  posterUrl: string;
  overview: string;
  ottPlatforms: string[];
  genre: string[];
  director: string;
  cast: string[];
  searchKeywords: string[];
}

export interface SearchResult {
  movies: Movie[];
  dramas: Movie[];
  totalResults: number;
}

export class DataLoader {
  private movies: Movie[] = [];
  private dramas: Movie[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    // 영화 데이터 로드
    this.movies = movieData.movies.map(movie => ({
      ...movie,
      type: 'movie' as const
    }));

    // 드라마 데이터 로드
    this.dramas = movieData.dramas.map(drama => ({
      ...drama,
      type: 'drama' as const
    }));
  }

  // 전체 영화 목록 가져오기
  getAllMovies(): Movie[] {
    return this.movies;
  }

  // 전체 드라마 목록 가져오기
  getAllDramas(): Movie[] {
    return this.dramas;
  }

  // 전체 콘텐츠 가져오기
  getAllContent(): Movie[] {
    return [...this.movies, ...this.dramas];
  }

  // 검색 기능
  searchContent(query: string): SearchResult {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
      return {
        movies: [],
        dramas: [],
        totalResults: 0
      };
    }

    const searchInContent = (content: Movie[]): Movie[] => {
      return content.filter(item => {
        // 제목 검색
        if (item.title.toLowerCase().includes(searchTerm) ||
            item.originalTitle.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // 감독 검색
        if (item.director.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // 배우 검색
        if (item.cast.some(actor => actor.toLowerCase().includes(searchTerm))) {
          return true;
        }

        // 장르 검색
        if (item.genre.some(genre => genre.toLowerCase().includes(searchTerm))) {
          return true;
        }

        // 검색 키워드 검색
        if (item.searchKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) {
          return true;
        }

        return false;
      });
    };

    const matchedMovies = searchInContent(this.movies);
    const matchedDramas = searchInContent(this.dramas);

    return {
      movies: matchedMovies,
      dramas: matchedDramas,
      totalResults: matchedMovies.length + matchedDramas.length
    };
  }

  // 인기 콘텐츠 가져오기 (평점 기준)
  getPopularContent(limit: number = 10): Movie[] {
    const allContent = this.getAllContent();
    return allContent
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // 최신 콘텐츠 가져오기 (연도 기준)
  getRecentContent(limit: number = 10): Movie[] {
    const allContent = this.getAllContent();
    return allContent
      .sort((a, b) => b.year - a.year)
      .slice(0, limit);
  }

  // OTT 플랫폼별 콘텐츠 가져오기
  getContentByPlatform(platform: string): Movie[] {
    const allContent = this.getAllContent();
    return allContent.filter(item => 
      item.ottPlatforms.some(p => p.toLowerCase().includes(platform.toLowerCase()))
    );
  }

  // 장르별 콘텐츠 가져오기
  getContentByGenre(genre: string): Movie[] {
    const allContent = this.getAllContent();
    return allContent.filter(item => 
      item.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  // 특정 콘텐츠 상세 정보 가져오기
  getContentById(id: number): Movie | null {
    const allContent = this.getAllContent();
    return allContent.find(item => item.id === id) || null;
  }

  // 통계 정보 가져오기
  getStats() {
    return {
      totalMovies: this.movies.length,
      totalDramas: this.dramas.length,
      totalContent: this.movies.length + this.dramas.length,
      averageRating: this.calculateAverageRating(),
      platforms: this.getUniquePlatforms(),
      genres: this.getUniqueGenres()
    };
  }

  private calculateAverageRating(): number {
    const allContent = this.getAllContent();
    if (allContent.length === 0) return 0;
    
    const totalRating = allContent.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / allContent.length) * 10) / 10;
  }

  private getUniquePlatforms(): string[] {
    const allContent = this.getAllContent();
    const platforms = new Set<string>();
    
    allContent.forEach(item => {
      item.ottPlatforms.forEach(platform => platforms.add(platform));
    });
    
    return Array.from(platforms).sort();
  }

  private getUniqueGenres(): string[] {
    const allContent = this.getAllContent();
    const genres = new Set<string>();
    
    allContent.forEach(item => {
      item.genre.forEach(genre => genres.add(genre));
    });
    
    return Array.from(genres).sort();
  }
}

export const dataLoader = new DataLoader(); 