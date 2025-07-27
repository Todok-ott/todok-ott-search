import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { debugOTTInfo } from '@/lib/ottUtils';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: '검색어가 필요합니다' }, { status: 400 });
    }
    
    console.log('=== 디버그 검색 시작 ===');
    console.log('검색어:', query);
    
    // 여러 검색어로 테스트
    const searchQueries = [
      query,
      query.replace('THE ANOMATION', 'THE ANIMATION'), // 오타 수정
      'Nukitashi',
      'Nukitashi THE ANIMATION',
      '누키타시',
      '누키타시 THE ANIMATION'
    ];
    
    const allResults = [];
    
    for (const searchQuery of searchQueries) {
      console.log(`검색 시도: "${searchQuery}"`);
      const searchResults = await tmdbClient.searchMulti(searchQuery);
      
      if (searchResults?.results?.length > 0) {
        // 각 결과에 OTT 정보 추가 및 디버깅
        const resultsWithOTT = await Promise.all(
          searchResults.results.slice(0, 3).map(async (result) => {
            try {
              let ottInfo = null;
              
              if (result.media_type === 'movie') {
                console.log(`영화 OTT 정보 가져오기: ${result.title} (ID: ${result.id})`);
                const providers = await tmdbClient.getMovieWatchProviders(result.id);
                const providerData = providers as { results?: { KR?: unknown } };
                ottInfo = providerData.results?.KR || null;
                console.log(`영화 OTT 결과:`, ottInfo);
              } else if (result.media_type === 'tv') {
                console.log(`TV OTT 정보 가져오기: ${result.title} (ID: ${result.id})`);
                const providers = await tmdbClient.getTVWatchProviders(result.id);
                const providerData = providers as { results?: { KR?: unknown } };
                ottInfo = providerData.results?.KR || null;
                console.log(`TV OTT 결과:`, ottInfo);
              }
              
              const resultWithOTT = {
                ...result,
                ott_providers: ottInfo
              };
              
              // 디버깅 정보 출력
              debugOTTInfo(resultWithOTT);
              
              return resultWithOTT;
            } catch (error) {
              console.error('OTT 정보 가져오기 실패:', error);
              return result;
            }
          })
        );
        
        allResults.push({
          searchQuery,
          results: resultsWithOTT,
          total: searchResults.total_results
        });
        console.log(`"${searchQuery}" 검색 성공: ${searchResults.total_results}개 결과`);
      } else {
        console.log(`"${searchQuery}" 검색 실패: 결과 없음`);
      }
    }
    
    return NextResponse.json({
      originalQuery: query,
      searchQueries,
      successfulResults: allResults,
      totalSuccessful: allResults.length
    });
    
  } catch (error) {
    console.error('디버그 검색 에러:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 