import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET() {
  try {
    console.log('인기 TV 쇼 API 호출 시작');
    
    // 3페이지(60개)를 가져와서 50개만 반환
    const [page1, page2, page3] = await Promise.all([
      tmdbClient.getPopularTVShows(1),
      tmdbClient.getPopularTVShows(2),
      tmdbClient.getPopularTVShows(3)
    ]);
    
    console.log('TMDB TV API 응답 받음:', {
      page1Results: page1.results?.length || 0,
      page2Results: page2.results?.length || 0,
      page3Results: page3.results?.length || 0
    });
    
    const allTVShows = [
      ...(page1.results || []),
      ...(page2.results || []),
      ...(page3.results || [])
    ];
    
    const response = {
      results: allTVShows.slice(0, 50), // 50개로 제한
      total_pages: 3,
      total_results: allTVShows.length,
      page: 1
    };
    
    console.log('인기 TV 쇼 API 응답 완료:', {
      totalTVShows: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Popular TV shows API error:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = '인기 TV 쇼를 불러오는 중 오류가 발생했습니다.';
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