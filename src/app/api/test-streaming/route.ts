import { NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

export async function GET() {
  try {
    console.log('=== Streaming Availability API 테스트 시작 ===');
    
    // API 키 확인
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    console.log('API 키 설정 여부:', !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.',
        message: '.env.local 파일에 STREAMING_AVAILABILITY_API_KEY를 설정해주세요.',
        steps: [
          '1. RapidAPI에서 Streaming Availability API 구독',
          '2. API 키 복사',
          '3. .env.local 파일에 STREAMING_AVAILABILITY_API_KEY=your_key 추가',
          '4. Vercel 환경 변수에도 동일하게 설정'
        ]
      }, { status: 500 });
    }
    
    // 다양한 테스트 호출
    console.log('넷플릭스 영화 조회 테스트...');
    const netflixResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service: 'netflix',
      type: 'movie',
      page: 1,
      language: 'ko'
    });
    
    console.log('넷플릭스 드라마 조회 테스트...');
    const netflixSeriesResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service: 'netflix',
      type: 'series',
      page: 1,
      language: 'ko'
    });
    
    console.log('모든 한국 OTT 조회 테스트...');
    const allKoreanResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service: 'netflix,watcha,wavve,tving,disney',
      type: 'movie',
      page: 1,
      language: 'ko'
    });
    
    console.log('테스트 결과:', {
      netflix: netflixResults,
      netflixSeries: netflixSeriesResults,
      allKorean: allKoreanResults
    });
    
    return NextResponse.json({
      success: true,
      api_key_configured: true,
      test_results: {
        netflix_movies: {
          total_results: netflixResults.results.length,
          first_movie: netflixResults.results[0] ? {
            id: netflixResults.results[0].id,
            title: netflixResults.results[0].title,
            type: netflixResults.results[0].type,
            year: netflixResults.results[0].year
          } : null,
          total_pages: netflixResults.totalPages
        },
        netflix_series: {
          total_results: netflixSeriesResults.results.length,
          first_series: netflixSeriesResults.results[0] ? {
            id: netflixSeriesResults.results[0].id,
            title: netflixSeriesResults.results[0].title,
            type: netflixSeriesResults.results[0].type,
            year: netflixSeriesResults.results[0].year
          } : null,
          total_pages: netflixSeriesResults.totalPages
        },
        all_korean: {
          total_results: allKoreanResults.results.length,
          first_content: allKoreanResults.results[0] ? {
            id: allKoreanResults.results[0].id,
            title: allKoreanResults.results[0].title,
            type: allKoreanResults.results[0].type,
            year: allKoreanResults.results[0].year
          } : null,
          total_pages: allKoreanResults.totalPages
        }
      },
      message: 'Streaming Availability API가 정상 작동합니다!'
    });
    
  } catch (error) {
    console.error('Streaming Availability API 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 