import { NextResponse } from 'next/server';
import { tmdbClient, Movie } from '@/lib/tmdb';

interface MovieWithKoreanOTT extends Movie {
  korean_ott_providers?: unknown[];
}

export async function GET() {
  try {
    const trendingData = await tmdbClient.getTrending('week');
    
    // 확실히 문제가 있는 ID들 차단
    const blockedIds = [244808, 112470, 65270, 22980, 65701, 59941, 1399];
    
    // OTT 정보를 개별적으로 가져와서 필터링
    const contentWithOTT = await Promise.all(
      (trendingData.results || []).map(async (item: MovieWithKoreanOTT) => {
        try {
          // 문제가 있는 ID는 제외
          if (blockedIds.includes(item.id)) {
            console.log('차단된 ID 제외:', item.id);
            return null;
          }
          
          // 영화인지 TV인지 확인
          const isMovie = item.media_type === 'movie' || item.title;
          const isTV = item.media_type === 'tv' || item.name;
          
          let ottData = null;
          let koreanOTTData = null;
          
          if (isMovie) {
            // 영화 OTT 정보 가져오기
            ottData = await tmdbClient.getMovieWatchProviders(item.id);
            koreanOTTData = null; // 한국 OTT 정보는 일단 제외
          } else if (isTV) {
            // TV OTT 정보 가져오기
            ottData = await tmdbClient.getTVWatchProviders(item.id);
            koreanOTTData = null; // 한국 OTT 정보는 일단 제외
          }
          
          // OTT 정보가 있는지 확인
          const hasTMDB = !!(ottData && typeof ottData === 'object' && 'KR' in ottData && (ottData as any).KR && (ottData as any).KR.flatrate && (ottData as any).KR.flatrate.length > 0);
          const hasKorean = false; // 한국 OTT 정보는 일단 제외
          
          const hasOTT = hasTMDB || hasKorean;
          
          if (!hasOTT) {
            console.log('OTT 정보 없는 콘텐츠 제외:', item.id, item.title || item.name);
            return null;
          }
          
          // OTT 정보 추가
          return {
            ...item,
            ott_providers: (ottData as any)?.KR || null,
            korean_ott_providers: null
          };
        } catch (error) {
          console.log('OTT 정보 가져오기 실패:', item.id, error);
          return null;
        }
      })
    );
    
    // null 값 제거하고 필터링된 결과만 반환
    const filteredResults = contentWithOTT.filter(item => item !== null);
    
    const response = {
      ...trendingData,
      results: filteredResults
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
} 