import { NextResponse } from 'next/server';
import { dataLoader } from '@/lib/dataLoader';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

export async function GET() {
  try {
    console.log('트렌딩 API 호출 시작');
    
    // 로컬 데이터에서 인기 콘텐츠 가져오기 (평점 기준)
    const popularContent = dataLoader.getPopularContent(30);
    console.log('로컬 인기 콘텐츠 로드:', popularContent.length);
    
    // Streaming Availability API로 OTT 정보 추가
    const contentWithOTT = [];
    
    for (const content of popularContent.slice(0, 20)) { // 성능을 위해 20개만 처리
      try {
        const streamingData = await streamingAvailabilityClient.searchByTitle(content.title);
        
        if (streamingData && streamingData.results && streamingData.results.length > 0) {
          const firstResult = streamingData.results[0];
          const processedResult = streamingAvailabilityClient.processKoreanMetadata(firstResult);
          const ottProviders = streamingAvailabilityClient.convertResultsToOTTProviders([processedResult]);
          
          const contentWithOTTItem = {
            id: content.id,
            title: processedResult.title,
            media_type: processedResult.type === 'movie' ? 'movie' : 'tv',
            overview: processedResult.overview || `${processedResult.title} (${processedResult.year})`,
            release_date: processedResult.type === 'movie' ? `${processedResult.year}-01-01` : undefined,
            first_air_date: processedResult.type === 'series' ? `${processedResult.year}-01-01` : undefined,
            vote_average: content.rating || 0,
            popularity: content.rating || 0,
            poster_path: processedResult.posterPath || content.posterUrl,
            ott_providers: ottProviders,
            local_data: true
          };
          
          contentWithOTT.push(contentWithOTTItem);
        } else {
          // OTT 정보가 없어도 기본 정보는 포함
          const contentWithOTTItem = {
            id: content.id,
            title: content.title,
            media_type: content.type === 'movie' ? 'movie' : 'tv',
            overview: content.overview || `${content.title} (${content.year})`,
            release_date: content.type === 'movie' ? `${content.year}-01-01` : undefined,
            first_air_date: content.type === 'drama' ? `${content.year}-01-01` : undefined,
            vote_average: content.rating || 0,
            popularity: content.rating || 0,
            poster_path: content.posterUrl,
            ott_providers: { KR: { flatrate: [], buy: [], rent: [] } },
            local_data: true
          };
          
          contentWithOTT.push(contentWithOTTItem);
        }
      } catch (error) {
        console.error(`콘텐츠 "${content.title}" OTT 정보 가져오기 실패:`, error);
        
        // 에러가 있어도 기본 정보는 포함
        const contentWithOTTItem = {
          id: content.id,
          title: content.title,
          media_type: content.type === 'movie' ? 'movie' : 'tv',
          overview: content.overview || `${content.title} (${content.year})`,
          release_date: content.type === 'movie' ? `${content.year}-01-01` : undefined,
          first_air_date: content.type === 'drama' ? `${content.year}-01-01` : undefined,
          vote_average: content.rating || 0,
          popularity: content.rating || 0,
          poster_path: content.posterUrl,
          ott_providers: { KR: { flatrate: [], buy: [], rent: [] } },
          local_data: true
        };
        
        contentWithOTT.push(contentWithOTTItem);
      }
    }
    
    console.log('OTT 정보 추가 완료:', contentWithOTT.length);
    
    // OTT 정보가 있는 콘텐츠만 필터링 (일시적으로 비활성화)
    // const filteredTrending = filterByOTT(contentWithOTT);
    const filteredTrending = contentWithOTT; // 필터링 비활성화
    console.log('OTT 필터링 후 트렌딩 콘텐츠 수:', filteredTrending.length);
    
    const response = {
      results: filteredTrending.slice(0, 50), // 50개로 조정
      total_pages: 1,
      total_results: filteredTrending.length,
      page: 1,
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };
    
    console.log('트렌딩 API 응답 완료:', {
      totalTrending: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Trending API error:', error);
    
    let errorMessage = '트렌딩 콘텐츠를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('API Error: 429')) {
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