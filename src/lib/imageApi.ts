// 무료 이미지 API 클라이언트들

export interface ImageResult {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
}

// Unsplash API (무료, 고화질 이미지)
export class UnsplashClient {
  private accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  private baseUrl = 'https://api.unsplash.com';

  async searchImages(query: string, page: number = 1): Promise<ImageResult[]> {
    if (!this.accessKey) {
      return this.getMockImages(query);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unsplash API error');
      }

      const data = await response.json();
      return data.results.map((item: { id: string; description?: string; alt_description?: string; urls: { regular: string; thumb: string } }) => ({
        id: item.id,
        title: item.description || item.alt_description || query,
        imageUrl: item.urls.regular,
        thumbnailUrl: item.urls.thumb,
        source: 'Unsplash'
      }));
    } catch (error) {
      console.error('Unsplash API error:', error);
      return this.getMockImages(query);
    }
  }

  private getMockImages(query: string): ImageResult[] {
    // 영화 포스터 스타일 이미지들 (사용되지 않는 변수 제거)
    
    return [
      {
        id: '1',
        title: `${query} 포스터 1`,
        imageUrl: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 1000)}`,
        thumbnailUrl: `https://picsum.photos/150/225?random=${Math.floor(Math.random() * 1000)}`,
        source: 'Picsum'
      },
      {
        id: '2',
        title: `${query} 포스터 2`,
        imageUrl: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 1000)}`,
        thumbnailUrl: `https://picsum.photos/150/225?random=${Math.floor(Math.random() * 1000)}`,
        source: 'Picsum'
      },
      {
        id: '3',
        title: `${query} 포스터 3`,
        imageUrl: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 1000)}`,
        thumbnailUrl: `https://picsum.photos/150/225?random=${Math.floor(Math.random() * 1000)}`,
        source: 'Picsum'
      }
    ];
  }
}

// Picsum API (완전 무료, 랜덤 이미지)
export class PicsumClient {
  async getRandomImages(count: number = 10): Promise<ImageResult[]> {
    const images: ImageResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomId = Math.floor(Math.random() * 1000);
      images.push({
        id: `picsum-${randomId}`,
        title: `영화 포스터 ${i + 1}`,
        imageUrl: `https://picsum.photos/300/450?random=${randomId}`,
        thumbnailUrl: `https://picsum.photos/150/225?random=${randomId}`,
        source: 'Picsum'
      });
    }
    
    return images;
  }

  async searchImages(): Promise<ImageResult[]> {
    // Picsum은 검색 기능이 없으므로 랜덤 이미지 반환
    return this.getRandomImages(5);
  }
}

// 영화 포스터 전용 클라이언트
export class MoviePosterClient {
  private picsumClient = new PicsumClient();
  private unsplashClient = new UnsplashClient();

  async getMoviePosters(movieTitle: string): Promise<ImageResult[]> {
    // 영화 제목으로 더 구체적인 검색
    const searchQueries = [
      `${movieTitle} movie poster`,
      `${movieTitle} film poster`,
      `${movieTitle} cinematic poster`,
      `${movieTitle} dramatic scene`,
      `${movieTitle} movie scene`
    ];
    
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    
    try {
      // Unsplash에서 영화 포스터 검색
      const unsplashResults = await this.unsplashClient.searchImages(randomQuery);
      
      if (unsplashResults.length > 0) {
        return unsplashResults;
      }
      
      // 실패하면 Picsum 랜덤 이미지 사용
      return this.picsumClient.getRandomImages(3);
    } catch (error) {
      console.error('Movie poster search error:', error);
      return this.picsumClient.getRandomImages(3);
    }
  }

  async getRandomPosters(count: number = 10): Promise<ImageResult[]> {
    return this.picsumClient.getRandomImages(count);
  }
}

export const moviePosterClient = new MoviePosterClient();
export const unsplashClient = new UnsplashClient();
export const picsumClient = new PicsumClient(); 