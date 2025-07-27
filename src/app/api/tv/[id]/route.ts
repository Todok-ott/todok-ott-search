import { NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('TV API 호출:', { id });
    
    // URL에서 제목 파라미터 추출
    const url = new URL(request.url);
    const titleParam = url.searchParams.get('title');
    
    let searchQuery = id; // 기본적으로 ID를 검색어로 사용
    
    // 제목 파라미터가 있으면 제목으로 검색
    if (titleParam) {
      searchQuery = titleParam;
      console.log('제목 파라미터로 검색:', searchQuery);
    }
    
    // 검색어 정리 (특수문자 제거, 공백 정리)
    searchQuery = searchQuery.replace(/[^\w\s가-힣]/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('정리된 검색어:', searchQuery);
    
    let tvDetails = null;
    let ottProviders = null;
    
    try {
      // Streaming Availability API로 검색
      console.log('Streaming Availability 검색 시도:', searchQuery);
      const streamingData = await streamingAvailabilityClient.searchByTitle(searchQuery);
      
      if (streamingData && streamingData.results && streamingData.results.length > 0) {
        const firstResult = streamingData.results[0];
        const processedResult = streamingAvailabilityClient.processKoreanMetadata(firstResult);
        
        tvDetails = {
          id: parseInt(id),
          name: processedResult.title,
          overview: processedResult.overview || `${processedResult.title} (${processedResult.year})`,
          first_air_date: `${processedResult.year}-01-01`,
          vote_average: 0,
          media_type: 'tv',
          popularity: 0,
          vote_count: 0,
          original_language: 'ko',
          origin_country: ['KR']
        };
        
        ottProviders = streamingAvailabilityClient.convertResultsToOTTProviders([processedResult]);
        
        console.log('Streaming Availability 검색 성공:', tvDetails);
      } else {
        console.log('Streaming Availability 검색 결과 없음');
      }
    } catch (searchError) {
      console.error('Streaming Availability 검색 실패:', searchError);
    }
    
    // 최종적으로 TV 정보를 찾지 못한 경우
    if (!tvDetails) {
      console.error('TV 정보를 찾을 수 없음');
      return NextResponse.json(
        { error: 'TV 쇼 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 기본 응답 구조
    const response = {
      ...tvDetails,
      ott_providers: ottProviders || { KR: { flatrate: [], buy: [], rent: [] } },
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };
    
    console.log('TV API 응답 완료');
    return NextResponse.json(response);
  } catch (error) {
    console.error('TV details API error:', error);
    
    let errorMessage = 'TV 쇼 정보를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('API Error: 404')) {
        errorMessage = 'TV 쇼를 찾을 수 없습니다.';
        statusCode = 404;
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