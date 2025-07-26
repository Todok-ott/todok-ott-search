import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient, Movie } from '@/lib/tmdb';
import { enhanceWithKoreanOTTInfo } from '@/lib/koreanOTTs';

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

    console.log('검색 요청:', query.trim());

    // TMDB API로 검색 (재시도 로직 포함)
    let searchResult;
    try {
      // 한국어 검색어에 대한 특별 처리
      const searchQuery = query.trim();
      const isKorean = /[가-힣]/.test(searchQuery);
      
      // 한국어인 경우 영화와 TV를 각각 검색하여 더 정확한 결과 제공
      if (isKorean) {
        const [movieResults, tvResults] = await Promise.all([
          tmdbClient.searchMovies(searchQuery, parseInt(page)),
          tmdbClient.searchTV(searchQuery, parseInt(page))
        ]);
        
        // 결과를 합치고 정확도 순으로 정렬
        const combinedResults = [
          ...(movieResults.results || []).map((item: Movie) => ({ ...item, media_type: 'movie' })),
          ...(tvResults.results || []).map((item: Movie) => ({ ...item, media_type: 'tv' }))
        ];
        
        // 제목 유사도에 따라 정렬 (한국어 검색어와 가장 유사한 것 우선)
        combinedResults.sort((a, b) => {
          const aTitle = (a.title || a.name || '').toLowerCase();
          const bTitle = (b.title || b.name || '').toLowerCase();
          const queryLower = searchQuery.toLowerCase();
          
          const aExact = aTitle.includes(queryLower);
          const bExact = bTitle.includes(queryLower);
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          return 0;
        });
        
        searchResult = {
          results: combinedResults.slice(0, 20), // 상위 20개만 반환
          total_pages: Math.max(movieResults.total_pages || 0, tvResults.total_pages || 0),
          total_results: combinedResults.length
        };
      } else {
        // 영어 검색은 기존 방식 사용
        searchResult = await tmdbClient.searchMulti(searchQuery, parseInt(page));
      }
    } catch (error) {
      console.error('TMDB 검색 실패:', error);
      return NextResponse.json(
        { 
          error: '검색 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
          results: [],
          total_pages: 0,
          total_results: 0
        },
        { status: 503 }
      );
    }
    
    // 각 결과에 OTT 정보 추가 (최대 5개까지만 처리하여 성능 최적화)
    let resultsWithOTT = await Promise.all(
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
    
    // 한국어 검색인 경우 한국 OTT 정보 추가
    const isKorean = /[가-힣]/.test(query.trim());
    if (isKorean) {
      resultsWithOTT = enhanceWithKoreanOTTInfo(resultsWithOTT);
    }
    
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