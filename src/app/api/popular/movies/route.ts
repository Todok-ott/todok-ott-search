import { NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

export async function GET(request: Request) {
  try {
    console.log('인기 영화 API 호출 시작');
    
    // Streaming Availability API로 한국 OTT 영화 조회
    let ottResults;
    try {
      ottResults = await streamingAvailabilityClient.fetchOTTMovies({
        country: 'kr',
        service: 'netflix,watcha,wavve,tving,disney,laftel',
        type: 'movie',
        page: 1,
        language: 'ko'
      });
      
      console.log('OTT 영화 조회 결과:', ottResults.results.length);
    } catch (error) {
      console.log('Streaming Availability API 실패, 로컬 데이터 사용');
      // API 실패 시 로컬 데이터 사용
      const { dataLoader } = await import('@/lib/dataLoader');
      const localMovies = dataLoader.getAllMovies();
      
      ottResults = {
        results: localMovies.map(movie => ({
          id: movie.id.toString(),
          title: movie.title,
          type: 'movie' as const,
          year: movie.year,
          posterPath: movie.posterUrl,
          overview: movie.overview
        })),
        totalPages: 1,
        nextPage: null
      };
    }
    
    // 결과를 표준 형식으로 변환 (한글 메타데이터 fallback 처리 포함)
    const processedResults = streamingAvailabilityClient.processKoreanMetadataForResults(ottResults.results);
    
    const movies = processedResults.map((item, index) => ({
      id: item.id || `ott-${index}`,
      title: item.title || '제목 없음',
      media_type: 'movie',
      overview: item.overview || `${item.title} (${item.year})`,
      release_date: `${item.year}-01-01`,
      vote_average: 8.0, // 기본 평점
      popularity: 8.0,
      poster_path: item.posterPath || item.posterURLs?.original || '/placeholder-poster.jpg',
      ott_providers: streamingAvailabilityClient.convertResultsToOTTProviders([item]),
      streaming_data: item,
      // 한글 메타데이터 상태 표시
      has_korean_metadata: streamingAvailabilityClient.hasKoreanMetadata(item),
      needs_english_fallback: streamingAvailabilityClient.needsEnglishFallback(item)
    }));
    
    console.log('변환된 영화 수:', movies.length);
    
    const response = {
      results: movies.slice(0, 50), // 50개로 제한
      total_pages: ottResults.totalPages,
      total_results: movies.length,
      page: 1,
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };
    
    console.log('인기 영화 API 응답 완료:', {
      totalMovies: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Popular movies API error:', error);
    
    let errorMessage = '인기 영화를 불러오는 중 오류가 발생했습니다.';
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
        details: error instanceof Error ? error.message : 'Unknown error',
        api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY
      },
      { status: statusCode }
    );
  }
} 