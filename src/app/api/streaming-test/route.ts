import { NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') || 'netflix';
    const type = searchParams.get('type') || 'movie';
    const page = parseInt(searchParams.get('page') || '1');

    console.log('Streaming Availability API 테스트 시작:', { service, type, page });

    // 1. OTT별 작품 리스트 조회
    const ottResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service,
      type: type as 'movie' | 'series',
      page,
      language: 'ko'
    });

    console.log('OTT 결과:', {
      totalResults: ottResults.results.length,
      totalPages: ottResults.totalPages,
      nextPage: ottResults.nextPage
    });

    // 2. 첫 번째 결과의 상세정보 조회 (예시)
    let detailResult = null;
    if (ottResults.results.length > 0) {
      const firstResult = ottResults.results[0];
      detailResult = await streamingAvailabilityClient.fetchShowDetail(
        firstResult.id,
        'kr',
        'ko'
      );
    }

    // 3. 모든 한국 OTT 콘텐츠 조회
    const allKoreanResults = await streamingAvailabilityClient.fetchAllKoreanOTTContent(1);

    const response = {
      test_info: {
        service,
        type,
        page,
        api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY
      },
      ott_results: {
        total_results: ottResults.results.length,
        total_pages: ottResults.totalPages,
        next_page: ottResults.nextPage,
        results: ottResults.results.slice(0, 5) // 처음 5개만 표시
      },
      detail_example: detailResult ? {
        id: detailResult.id,
        title: detailResult.title,
        type: detailResult.type,
        year: detailResult.year,
        poster_path: detailResult.posterPath,
        overview: detailResult.overview,
        streaming_services: detailResult.streamingInfo?.kr ? 
          Object.keys(detailResult.streamingInfo.kr) : []
      } : null,
      all_korean_ott: {
        total_results: allKoreanResults.results.length,
        total_pages: allKoreanResults.totalPages,
        next_page: allKoreanResults.nextPage,
        results: allKoreanResults.results.slice(0, 3) // 처음 3개만 표시
      },
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };

    console.log('Streaming Availability API 테스트 완료');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Streaming Availability API 테스트 오류:', error);
    
    return NextResponse.json(
      { 
        error: 'Streaming Availability API 테스트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
        api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY
      },
      { status: 500 }
    );
  }
} 