import { NextResponse } from 'next/server';
import { tmdbWithOTTClient } from '@/lib/tmdbWithOTT';

export async function GET() {
  try {
    console.log('인기 영화 API 호출 시작 (TMDB + OTT)');
    
    // TMDB API로 인기 영화 가져오기 (한국 OTT 정보 포함)
    const movies = await tmdbWithOTTClient.getPopularMovies();
    
    console.log('TMDB 영화 조회 결과:', movies.results.length);
    
    const response = {
      results: movies.results.slice(0, 50), // 50개로 제한
      total_pages: movies.total_pages,
      total_results: movies.total_results,
      page: movies.page,
      api_credits: {
        tmdb: 'Powered by TMDB API',
        ott_simulation: 'OTT 정보는 시뮬레이션 데이터입니다.'
      }
    };
    
    console.log('인기 영화 API 응답 완료:', {
      totalMovies: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Popular movies API error:', error);
    
    let errorMessage = '인기 영화를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('TMDB API 오류: 401')) {
        errorMessage = 'TMDB API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('TMDB API 오류: 429')) {
        errorMessage = 'TMDB API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 429;
      } else {
        errorMessage = `TMDB API 오류: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        api_key_configured: !!process.env.TMDB_API_KEY
      },
      { status: statusCode }
    );
  }
} 