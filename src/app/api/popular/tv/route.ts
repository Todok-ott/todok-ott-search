import { NextResponse } from 'next/server';
import { tmdbClient, Movie } from '@/lib/tmdb';

interface MovieWithKoreanOTT extends Movie {
  korean_ott_providers?: unknown[];
}

export async function GET() {
  try {
    console.log('인기 TV 쇼 API 호출 시작');
    
    // 3페이지(60개)를 가져와서 50개만 반환 (성능 개선)
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
    
    // 확실히 문제가 있는 ID들 차단
    const blockedIds = [244808, 112470, 65270, 22980, 65701, 59941, 1399];
    
    // OTT 정보가 없는 콘텐츠는 제외 + 문제가 있는 ID 차단
    const filteredTVShows = allTVShows.filter((tv: MovieWithKoreanOTT) => {
      // 확실히 문제가 있는 ID 차단
      if (blockedIds.includes(tv.id)) {
        console.log('차단된 ID 제외:', tv.id);
        return false;
      }
      
      // TMDB ott_providers: flatrate만 체크 (undefined, null, 빈 배열, 빈 객체 모두 제외)
      const hasTMDB = !!(
        tv.ott_providers &&
        Array.isArray(tv.ott_providers.flatrate) &&
        tv.ott_providers.flatrate.length > 0
      );
      // Korean ott_providers: 안전하게 체크
      const hasKorean = !!(
        tv.korean_ott_providers &&
        Array.isArray(tv.korean_ott_providers) &&
        tv.korean_ott_providers.length > 0
      );
      
      const hasOTT = hasTMDB || hasKorean;
      
      // OTT 정보가 없으면 제외
      if (!hasOTT) {
        console.log('OTT 정보 없는 콘텐츠 제외:', tv.id, tv.name);
        return false;
      }
      
      return true; // OTT 정보가 있는 콘텐츠만 포함
    });
    
    const response = {
      results: filteredTVShows.slice(0, 50), // 50개로 조정
      total_pages: 3,
      total_results: filteredTVShows.length,
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