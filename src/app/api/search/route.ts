import { NextRequest, NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';
import { filterByOTT } from '@/lib/ottUtils';
import moviesData from '@/data/movies.json';

// 검색 결과 타입 정의
type SearchResult = {
  id: string;
  title: string;
  name?: string;
  media_type: 'movie' | 'tv';
  original_title?: string;
  display_title?: string;
  overview?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  popularity?: number;
  vote_count?: number;
  origin_country?: string[];
  original_language?: string;
  backdrop_path?: string;
  ott_providers?: {
    KR?: {
      flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      buy?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      rent?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
    };
  } | null;
  local_data?: boolean;
  year?: number;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        results: [], 
        total_pages: 0, 
        total_results: 0 
      });
    }

    console.log('=== Streaming Availability 검색 API 시작 ===');
    console.log('검색 요청:', query.trim());

    // 1단계: 로컬 데이터에서 검색
    const localResults = searchLocalData(query.trim());
    console.log('로컬 검색 결과:', localResults.length);

    // 2단계: Streaming Availability API로 검색
    const streamingResults: SearchResult[] = [];
    try {
      console.log(`Streaming Availability 검색: "${query.trim()}"`);
      const streamingData = await streamingAvailabilityClient.searchByTitle(query.trim());
      
      if (streamingData && streamingData.results && streamingData.results.length > 0) {
        const firstResult = streamingData.results[0];
        const processedResult = streamingAvailabilityClient.processKoreanMetadata(firstResult);
        const ottProviders = streamingAvailabilityClient.convertResultsToOTTProviders([processedResult]);
        
        const streamingResult: SearchResult = {
          id: `streaming_${Date.now()}`,
          title: processedResult.title,
          name: processedResult.title,
          media_type: processedResult.type === 'movie' ? 'movie' : 'tv',
          original_title: processedResult.originalTitle || processedResult.title,
          display_title: processedResult.title,
          overview: processedResult.overview || `${processedResult.title} (${processedResult.year})`,
          poster_path: processedResult.posterPath || '', // Streaming Availability API는 포스터를 제공하지 않음
          vote_average: 0,
          release_date: `${processedResult.year}-01-01`,
          first_air_date: processedResult.type === 'series' ? `${processedResult.year}-01-01` : undefined,
          genre_ids: [],
          popularity: 0,
          vote_count: 0,
          origin_country: ['KR'],
          original_language: 'ko',
          backdrop_path: '',
          ott_providers: ottProviders || undefined,
          year: processedResult.year,
          local_data: false
        };
        
        streamingResults.push(streamingResult);
        console.log('Streaming Availability 검색 결과:', streamingResults.length);
      }
    } catch (error) {
      console.error('Streaming Availability 검색 실패:', error);
    }

    // 3단계: 로컬 결과와 Streaming 결과 결합
    const combinedResults = localResults.concat(streamingResults);
    console.log('결합된 검색 결과:', combinedResults.length);

    // 4단계: OTT 필터링 적용
    const filteredResults = filterByOTT(combinedResults);
    console.log('OTT 필터링 후 결과:', filteredResults.length);

    return NextResponse.json({
      results: filteredResults,
      total_pages: Math.ceil(filteredResults.length / 20),
      total_results: filteredResults.length,
      source: 'streaming_availability',
      filtered: true,
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI',
        data_source: 'Streaming Availability API provides real-time OTT availability data'
      }
    });

  } catch (error) {
    console.error('검색 API 에러:', error);
    return NextResponse.json(
      { 
        error: '검색 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
        results: [],
        total_pages: 0,
        total_results: 0
      },
      { status: 500 }
    );
  }
}

// 로컬 데이터 검색 함수
function searchLocalData(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  
  console.log('로컬 검색 시작:', query);
  
  // 영화 검색
  for (const movie of moviesData.movies) {
    const title = movie.title.toLowerCase();
    const originalTitle = movie.originalTitle.toLowerCase();
    const displayTitle = movie.displayTitle.toLowerCase();
    const searchKeywords = movie.searchKeywords.map(k => k.toLowerCase());
    
    if (title.includes(queryLower) || 
        originalTitle.includes(queryLower) || 
        displayTitle.includes(queryLower) ||
        searchKeywords.some(keyword => keyword.includes(queryLower))) {
      
      console.log('영화 매칭됨:', movie.title);
      results.push({
        id: movie.tmdbId?.toString() || movie.id.toString(),
        title: movie.title,
        name: movie.title,
        original_title: movie.originalTitle,
        display_title: movie.displayTitle,
        media_type: movie.type === 'tv' ? 'tv' : 'movie',
        overview: movie.overview,
        poster_path: movie.posterUrl.startsWith('http') ? movie.posterUrl : movie.posterUrl,
        vote_average: movie.rating,
        release_date: movie.year ? `${movie.year}-01-01` : undefined,
        first_air_date: movie.type === 'tv' ? `${movie.year}-01-01` : undefined,
        genre_ids: movie.genre.map((_, index) => index + 1),
        popularity: movie.rating * 100,
        vote_count: Math.floor(movie.rating * 100),
        origin_country: ['KR'],
        original_language: 'ko',
        backdrop_path: movie.posterUrl.startsWith('http') ? movie.posterUrl : movie.posterUrl,
        ott_providers: {
          KR: {
            flatrate: movie.ottPlatforms.map((platform: string) => ({
              provider_id: Math.random(),
              provider_name: platform,
              logo_path: `/ott-logos/${platform.toLowerCase().replace(/\s+/g, '-')}.svg`
            }))
          }
        },
        year: movie.year,
        local_data: true
      });
    }
  }
  
  // 드라마 검색
  for (const drama of moviesData.dramas) {
    const title = drama.title.toLowerCase();
    const originalTitle = drama.originalTitle.toLowerCase();
    const displayTitle = drama.displayTitle.toLowerCase();
    const searchKeywords = drama.searchKeywords.map(k => k.toLowerCase());
    
    if (title.includes(queryLower) || 
        originalTitle.includes(queryLower) || 
        displayTitle.includes(queryLower) ||
        searchKeywords.some(keyword => keyword.includes(queryLower))) {
      
      console.log('드라마 매칭됨:', drama.title);
      results.push({
        id: drama.tmdbId?.toString() || drama.id.toString(),
        title: drama.title,
        name: drama.title,
        original_title: drama.originalTitle,
        display_title: drama.displayTitle,
        media_type: 'tv',
        overview: drama.overview,
        poster_path: drama.posterUrl.startsWith('http') ? drama.posterUrl : drama.posterUrl,
        vote_average: drama.rating,
        first_air_date: drama.year ? `${drama.year}-01-01` : undefined,
        genre_ids: drama.genre.map((_, index) => index + 1),
        popularity: drama.rating * 100,
        vote_count: Math.floor(drama.rating * 100),
        origin_country: ['KR'],
        original_language: 'ko',
        backdrop_path: drama.posterUrl.startsWith('http') ? drama.posterUrl : drama.posterUrl,
        ott_providers: {
          KR: {
            flatrate: drama.ottPlatforms.map((platform: string) => ({
              provider_id: Math.random(),
              provider_name: platform,
              logo_path: `/ott-logos/${platform.toLowerCase().replace(/\s+/g, '-')}.svg`
            }))
          }
        },
        year: drama.year,
        local_data: true
      });
    }
  }
  
  console.log('로컬 검색 완료, 결과 개수:', results.length);
  return results;
} 