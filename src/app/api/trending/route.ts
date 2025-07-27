import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET() {
  try {
    const trendingData = await tmdbClient.getTrending('week');
    
    // 확실히 문제가 있는 ID들 차단
    const blockedIds = [244808, 112470, 65270, 22980, 65701, 59941, 1399];
    
    // OTT 정보가 없는 콘텐츠는 제외 + 문제가 있는 ID 차단
    const filteredResults = (trendingData.results || []).filter((item) => {
      // 확실히 문제가 있는 ID 차단
      if (blockedIds.includes(item.id)) {
        console.log('차단된 ID 제외:', item.id);
        return false;
      }
      
      // TMDB ott_providers: flatrate만 체크 (undefined, null, 빈 배열, 빈 객체 모두 제외)
      const hasTMDB = !!(
        item.ott_providers &&
        Array.isArray(item.ott_providers.flatrate) &&
        item.ott_providers.flatrate.length > 0
      );
      // Korean ott_providers: 안전하게 체크
      const hasKorean = !!(
        item.korean_ott_providers &&
        Array.isArray(item.korean_ott_providers) &&
        item.korean_ott_providers.length > 0
      );
      
      const hasOTT = hasTMDB || hasKorean;
      
      // OTT 정보가 없으면 제외
      if (!hasOTT) {
        console.log('OTT 정보 없는 콘텐츠 제외:', item.id, item.title || item.name);
        return false;
      }
      
      return true; // OTT 정보가 있는 콘텐츠만 포함
    });
    
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