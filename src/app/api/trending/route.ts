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
    
    console.log('Trending API 응답 받음:', {
      totalResults: trendingData.results?.length || 0
    });
    
    // 확실히 문제가 있는 ID들 차단
    const blockedIds = [244808, 112470, 65270, 22980, 65701, 59941, 1399];
    
    // 임시: OTT 필터링 제거하고 모든 콘텐츠 반환
    const filteredResults = (trendingData.results || []).filter(item => !blockedIds.includes(item.id));
    
    console.log('차단된 ID 제거 후 콘텐츠 수:', filteredResults.length);
    
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