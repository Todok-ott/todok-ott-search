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
    
    // 다양한 API 엔드포인트 테스트
    console.log('=== 기본 검색 테스트 ===');
    const basicResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service: 'netflix',
      type: 'movie',
      page: 1,
      language: 'ko'
    });
    
    console.log('=== 제목 검색 테스트 ===');
    const searchResults = await streamingAvailabilityClient.searchByTitle('Avengers');
    
    console.log('=== 다른 국가 코드 테스트 ===');
    const usResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'us',
      service: 'netflix',
      type: 'movie',
      page: 1,
      language: 'en'
    });
    
    console.log('=== 다른 서비스 테스트 ===');
    const disneyResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service: 'disney',
      type: 'movie',
      page: 1,
      language: 'ko'
    });
    
    console.log('테스트 결과:', {
      basic: basicResults,
      search: searchResults,
      us: usResults,
      disney: disneyResults
    });
    
    return NextResponse.json({
      success: true,
      api_key_configured: true,
      test_results: {
        basic_search: {
          total_results: basicResults.results.length,
          first_movie: basicResults.results[0] ? {
            id: basicResults.results[0].id,
            title: basicResults.results[0].title,
            type: basicResults.results[0].type,
            year: basicResults.results[0].year
          } : null,
          total_pages: basicResults.totalPages
        },
        title_search: {
          total_results: searchResults?.results?.length || 0,
          first_movie: searchResults?.results?.[0] ? {
            id: searchResults.results[0].id,
            title: searchResults.results[0].title,
            type: searchResults.results[0].type,
            year: searchResults.results[0].year
          } : null,
          total_pages: searchResults?.total_pages || 1
        },
        us_netflix: {
          total_results: usResults.results.length,
          first_movie: usResults.results[0] ? {
            id: usResults.results[0].id,
            title: usResults.results[0].title,
            type: usResults.results[0].type,
            year: usResults.results[0].year
          } : null,
          total_pages: usResults.totalPages
        },
        disney_movies: {
          total_results: disneyResults.results.length,
          first_movie: disneyResults.results[0] ? {
            id: disneyResults.results[0].id,
            title: disneyResults.results[0].title,
            type: disneyResults.results[0].type,
            year: disneyResults.results[0].year
          } : null,
          total_pages: disneyResults.totalPages
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