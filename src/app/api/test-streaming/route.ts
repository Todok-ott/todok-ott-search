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
    
    // 간단한 테스트 호출
    console.log('넷플릭스 영화 조회 테스트...');
    const testResults = await streamingAvailabilityClient.fetchOTTMovies({
      country: 'kr',
      service: 'netflix',
      type: 'movie',
      page: 1,
      language: 'ko'
    });
    
    console.log('테스트 결과:', testResults);
    
    return NextResponse.json({
      success: true,
      api_key_configured: true,
      test_results: {
        total_results: testResults.results.length,
        first_movie: testResults.results[0] ? {
          id: testResults.results[0].id,
          title: testResults.results[0].title,
          type: testResults.results[0].type,
          year: testResults.results[0].year
        } : null,
        total_pages: testResults.totalPages
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