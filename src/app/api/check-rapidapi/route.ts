import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== RapidAPI 직접 확인 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // RapidAPI 콘솔에서 제공하는 기본 엔드포인트들
    const testEndpoints = [
      // 1. 가장 기본적인 테스트
      {
        name: 'basic_test',
        url: 'https://streaming-availability.p.rapidapi.com/search',
        method: 'GET',
        params: {
          country: 'us',
          service: 'netflix',
          type: 'movie',
          output_language: 'en',
          page: '1'
        }
      },
      // 2. 제목 검색 테스트
      {
        name: 'title_search',
        url: 'https://streaming-availability.p.rapidapi.com/search/title',
        method: 'GET',
        params: {
          title: 'Avengers',
          country: 'us',
          show_type: 'all',
          output_language: 'en'
        }
      },
      // 3. 상세정보 테스트
      {
        name: 'get_show',
        url: 'https://streaming-availability.p.rapidapi.com/get/show',
        method: 'GET',
        params: {
          country: 'us',
          show_id: 'tt0848228', // Avengers ID
          output_language: 'en'
        }
      }
    ];

    interface TestResult {
      url: string;
      method: string;
      status: number;
      statusText: string;
      exists: boolean;
      data?: unknown;
      error?: string;
    }

    const results: Record<string, TestResult> = {};

    for (const test of testEndpoints) {
      try {
        console.log(`테스트 중: ${test.name}`);
        
        // URL 파라미터 구성
        const url = new URL(test.url);
        Object.entries(test.params).forEach(([key, value]) => {
          url.searchParams.set(key, value as string);
        });

        console.log('호출 URL:', url.toString());

        const response = await fetch(url.toString(), {
          method: test.method,
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        });

        results[test.name] = {
          url: url.toString(),
          method: test.method,
          status: response.status,
          statusText: response.statusText,
          exists: response.status !== 404
        };

        if (response.ok) {
          const data = await response.json();
          results[test.name].data = data;
          console.log(`${test.name} 성공:`, data);
        } else {
          const errorText = await response.text();
          results[test.name].error = errorText;
          console.error(`${test.name} 실패:`, errorText);
        }

      } catch (error) {
        results[test.name] = {
          url: test.url,
          method: test.method,
          status: 0,
          statusText: 'Network Error',
          error: error instanceof Error ? error.message : 'Unknown error',
          exists: false
        };
        console.error(`${test.name} 네트워크 오류:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      api_key_configured: true,
      tests: results,
      message: 'RapidAPI 직접 확인 테스트 완료!',
      note: '이 결과를 바탕으로 실제 사용 가능한 엔드포인트를 확인하세요.'
    });
    
  } catch (error) {
    console.error('RapidAPI 직접 확인 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 