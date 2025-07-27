import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { filterByOTT } from '@/lib/ottUtils';

export async function GET() {
  try {
    console.log('트렌딩 API 호출 시작');
    
    // 단일 페이지로 트렌딩 데이터 가져오기
    const trendingData = await tmdbClient.getTrending('week');
    
    console.log('TMDB API 응답 받음:', {
      totalResults: trendingData.results?.length || 0
    });
    
    const allTrending = trendingData.results || [];
    
    console.log('전체 트렌딩 콘텐츠 수:', allTrending.length);
    
    // OTT 정보가 있는 콘텐츠만 필터링
    const filteredTrending = filterByOTT(allTrending);
    console.log('OTT 필터링 후 트렌딩 콘텐츠 수:', filteredTrending.length);
    
    const response = {
      results: filteredTrending.slice(0, 50), // 50개로 조정
      total_pages: 1,
      total_results: filteredTrending.length,
      page: 1
    };
    
    console.log('트렌딩 API 응답 완료:', {
      totalTrending: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Trending API error:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = '트렌딩 콘텐츠를 불러오는 중 오류가 발생했습니다.';
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