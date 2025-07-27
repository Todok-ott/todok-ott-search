import { NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';
import { debugOTTInfo, filterByOTT } from '@/lib/ottUtils';

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
      'Parasite',
      '기생충',
      'Squid Game',
      '오징어 게임'
    ];
    
    const allResults = [];
    
    for (const searchQuery of searchQueries) {
      console.log(`검색 시도: "${searchQuery}"`);
      
      try {
        const streamingData = await streamingAvailabilityClient.searchByTitle(searchQuery);
        
        if (streamingData && streamingData.results && streamingData.results.length > 0) {
          const firstResult = streamingData.results[0];
          const processedResult = streamingAvailabilityClient.processKoreanMetadata(firstResult);
          const ottProviders = streamingAvailabilityClient.convertResultsToOTTProviders([processedResult]);
          
          const result = {
            id: `streaming_${Date.now()}`,
            title: processedResult.title,
            media_type: processedResult.type === 'movie' ? 'movie' : 'tv',
            overview: processedResult.overview || `${processedResult.title} (${processedResult.year})`,
            release_date: `${processedResult.year}-01-01`,
            vote_average: 0,
            ott_providers: ottProviders
          };
          
          // 디버깅 정보 출력
          debugOTTInfo(result);
          
          // OTT 필터링 적용
          const filteredResults = filterByOTT([result]);
          
          allResults.push({
            searchQuery,
            results: filteredResults,
            total: 1,
            filtered: filteredResults.length
          });
          console.log(`"${searchQuery}" 검색 성공: 1개 결과 (필터링 후: ${filteredResults.length}개)`);
        } else {
          console.log(`"${searchQuery}" 검색 실패: 결과 없음`);
        }
      } catch (error) {
        console.error(`"${searchQuery}" 검색 실패:`, error);
      }
    }
    
    return NextResponse.json({
      originalQuery: query,
      searchQueries,
      successfulResults: allResults,
      totalSuccessful: allResults.length,
      filtered: true,
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    });
    
  } catch (error) {
    console.error('디버그 검색 에러:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 