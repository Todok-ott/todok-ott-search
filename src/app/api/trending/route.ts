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
          
          let ottData: WatchProviderData | null = null;
          
          if (isMovie) {
            // 영화 OTT 정보 가져오기
            ottData = await tmdbClient.getMovieWatchProviders(item.id) as WatchProviderData;
          } else if (isTV) {
            // TV OTT 정보 가져오기
            ottData = await tmdbClient.getTVWatchProviders(item.id) as WatchProviderData;
          }
          
          // 디버깅: OTT 데이터 구조 확인
          console.log(`${isMovie ? '영화' : 'TV'} ${item.id} (${item.title || item.name}) OTT 데이터:`, {
            hasKR: !!ottData?.KR,
            hasFlatrate: !!ottData?.KR?.flatrate,
            flatrateCount: ottData?.KR?.flatrate?.length || 0,
            hasRent: !!ottData?.KR?.rent,
            rentCount: ottData?.KR?.rent?.length || 0,
            hasBuy: !!ottData?.KR?.buy,
            buyCount: ottData?.KR?.buy?.length || 0
          });
          
          // OTT 정보가 있는지 확인 (flatrate, rent, buy 모두 체크)
          const hasFlatrate = !!(ottData?.KR?.flatrate && ottData.KR.flatrate.length > 0);
          const hasRent = !!(ottData?.KR?.rent && ottData.KR.rent.length > 0);
          const hasBuy = !!(ottData?.KR?.buy && ottData.KR.buy.length > 0);
          const hasKorean = false; // 한국 OTT 정보는 일단 제외
          
          const hasOTT = hasFlatrate || hasRent || hasBuy || hasKorean;
          
          if (!hasOTT) {
            console.log('OTT 정보 없는 콘텐츠 제외:', item.id, item.title || item.name);
            return null;
          }
          
          console.log('OTT 정보 있는 콘텐츠 포함:', item.id, item.title || item.name, {
            flatrate: hasFlatrate,
            rent: hasRent,
            buy: hasBuy
          });
          
          // OTT 정보 추가
          return {
            ...item,
            ott_providers: ottData?.KR || null,
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