import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        results: [], 
        total_pages: 0, 
        total_results: 0 
      });
    }

    // TMDB API로 검색
    const searchResult = await tmdbClient.searchMulti(query.trim(), parseInt(page));
    
    // 각 결과에 OTT 정보 추가 (최대 5개까지만 처리하여 성능 최적화)
    const resultsWithOTT = await Promise.all(
      searchResult.results.slice(0, 5).map(async (item) => {
        try {
          let ottInfo = null;
          if (item.media_type === 'movie') {
            const providers = await tmdbClient.getMovieWatchProviders(item.id);
            const providerData = providers as { results?: { KR?: unknown } };
            ottInfo = providerData.results?.KR || null;
          } else if (item.media_type === 'tv') {
            const providers = await tmdbClient.getTVWatchProviders(item.id);
            const providerData = providers as { results?: { KR?: unknown } };
            ottInfo = providerData.results?.KR || null;
          }
          
          return {
            ...item,
            ott_providers: ottInfo
          };
        } catch (error) {
          console.error(`Error fetching OTT info for ${item.id}:`, error);
          return item;
        }
      })
    );
    
    return NextResponse.json({
      results: resultsWithOTT,
      total_pages: searchResult.total_pages,
      total_results: searchResult.total_results,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 