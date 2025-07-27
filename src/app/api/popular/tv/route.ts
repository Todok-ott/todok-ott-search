import { NextResponse } from 'next/server';
import { tmdbClient, Movie } from '@/lib/tmdb';

interface MovieWithKoreanOTT extends Movie {
  korean_ott_providers?: unknown[];
}

interface WatchProviderData {
  KR?: {
    flatrate?: Array<{ provider_id: number; provider_name: string }>;
  };
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
    
    // OTT 정보를 개별적으로 가져와서 필터링
    const tvShowsWithOTT = await Promise.all(
      allTVShows.map(async (tv: MovieWithKoreanOTT) => {
        try {
          // 문제가 있는 ID는 제외
          if (blockedIds.includes(tv.id)) {
            console.log('차단된 ID 제외:', tv.id);
            return null;
          }
          
          // OTT 정보 가져오기
          const ottData = await tmdbClient.getTVWatchProviders(tv.id) as WatchProviderData;
          
          // OTT 정보가 있는지 확인
          const hasTMDB = !!(ottData && typeof ottData === 'object' && 'KR' in ottData && ottData.KR && ottData.KR.flatrate && ottData.KR.flatrate.length > 0);
          const hasKorean = false; // 한국 OTT 정보는 일단 제외
          
          const hasOTT = hasTMDB || hasKorean;
          
          if (!hasOTT) {
            console.log('OTT 정보 없는 콘텐츠 제외:', tv.id, tv.name);
            return null;
          }
          
          // OTT 정보 추가
          return {
            ...tv,
            ott_providers: ottData?.KR || null,
            korean_ott_providers: null
          };
        } catch (error) {
          console.log('OTT 정보 가져오기 실패:', tv.id, error);
          return null;
        }
      })
    );
    
    // null 값 제거하고 필터링된 결과만 반환
    const filteredTVShows = tvShowsWithOTT.filter(tv => tv !== null);
    
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