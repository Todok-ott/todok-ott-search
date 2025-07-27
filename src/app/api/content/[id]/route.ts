import { NextRequest, NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '콘텐츠 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`콘텐츠 상세 정보 요청: ${type} ${id}`);

    // Streaming Availability API로 상세 정보 가져오기
    let contentDetails = null;
    let ottProviders = null;

    try {
      // ID를 기반으로 제목을 추정하여 검색
      // 실제로는 ID와 제목 매핑이 필요하지만, 여기서는 기본 구조만 제공
      const searchResult = await streamingAvailabilityClient.searchByTitle(id);
      
      if (searchResult && searchResult.results && searchResult.results.length > 0) {
        const firstResult = searchResult.results[0];
        
        // 한글 메타데이터 처리
        const processedResult = streamingAvailabilityClient.processKoreanMetadata(firstResult);
        
        contentDetails = {
          id: parseInt(id),
          title: processedResult.title,
          overview: processedResult.overview || `${processedResult.title} (${processedResult.year})`,
          release_date: `${processedResult.year}-01-01`,
          vote_average: 0,
          media_type: type
        };
        
        ottProviders = streamingAvailabilityClient.convertResultsToOTTProviders([processedResult]);
      }
    } catch (error) {
      console.error('Streaming Availability API 오류:', error);
    }

    // 기본 응답 구조
    const response = {
      id: parseInt(id),
      title: `콘텐츠 ${id}`,
      overview: '상세 정보를 불러올 수 없습니다.',
      release_date: null,
      vote_average: 0,
      media_type: type,
      ott_providers: ottProviders || { KR: { flatrate: [], buy: [], rent: [] } },
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };

    // Streaming Availability에서 가져온 정보가 있으면 덮어쓰기
    if (contentDetails) {
      Object.assign(response, contentDetails);
    }

    console.log(`콘텐츠 상세 정보 완료: ${type} ${id}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('콘텐츠 상세 정보 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '콘텐츠 정보를 불러올 수 없습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 