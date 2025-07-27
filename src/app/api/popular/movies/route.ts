import { NextResponse } from 'next/server';
import { tmdbClient, Movie } from '@/lib/tmdb';

interface MovieWithKoreanOTT extends Movie {
  korean_ott_providers?: unknown[];
}

interface WatchProviderData {
  KR?: {
    flatrate?: Array<{ provider_id: number; provider_name: string }>;
    rent?: Array<{ provider_id: number; provider_name: string }>;
    buy?: Array<{ provider_id: number; provider_name: string }>;
  };
}

export async function GET() {
  try {
    console.log('인기 영화 API 호출 시작');
    
    // 3페이지(60개)를 가져와서 50개만 반환 (성능 개선)
    const [page1, page2, page3] = await Promise.all([
      tmdbClient.getPopularMovies(1),
      tmdbClient.getPopularMovies(2),
      tmdbClient.getPopularMovies(3)
    ]);
    
    console.log('TMDB API 응답 받음:', {
      page1Results: page1.results?.length || 0,
      page2Results: page2.results?.length || 0,
      page3Results: page3.results?.length || 0
    });
    
    const allMovies = [
      ...(page1.results || []),
      ...(page2.results || []),
      ...(page3.results || [])
    ];
    
    console.log('전체 영화 수:', allMovies.length);
    
    // 확실히 문제가 있는 ID들 차단
    const blockedIds = [244808, 112470, 65270, 22980, 65701, 59941, 1399];
    
    // 임시: OTT 필터링 제거하고 모든 영화 반환
    const filteredMovies = allMovies.filter(movie => !blockedIds.includes(movie.id));
    
    console.log('차단된 ID 제거 후 영화 수:', filteredMovies.length);
    
    // 임시: OTT 정보 없이 모든 영화 반환
    const response = {
      results: filteredMovies.slice(0, 50), // 50개로 조정
      total_pages: 3,
      total_results: filteredMovies.length,
      page: 1
    };
    
    console.log('인기 영화 API 응답 완료:', {
      totalMovies: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Popular movies API error:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = '인기 영화를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('TMDB API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('TMDB API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('TMDB API Error: 429')) {
        errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 429;
      } else {
        errorMessage = `API 오류: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
} 