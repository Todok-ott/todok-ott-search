import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== RapidAPI 콘솔 직접 확인 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // RapidAPI 콘솔에서 제공하는 실제 엔드포인트들
    const consoleEndpoints = [
      // 1. 기본 검색 (콘솔에서 제공하는 기본 엔드포인트)
      {
        name: 'console_basic_search',
        url: 'https://streaming-availability.p.rapidapi.com/v2/search/basic',
        method: 'GET',
        params: {
          country: 'us',
          service: 'netflix',
          type: 'movie',
          output_language: 'en',
          page: '1'
        }
      },
      // 2. 고급 검색 (콘솔에서 제공하는 고급 엔드포인트)
      {
        name: 'console_advanced_search',
        url: 'https://streaming-availability.p.rapidapi.com/v2/search/advanced',
        method: 'GET',
        params: {
          country: 'us',
          service: 'netflix',
          type: 'movie',
          output_language: 'en',
          page: '1',
          order_by: 'original_title'
        }
      },
      // 3. 제목 검색 (콘솔에서 제공하는 제목 검색)
      {
        name: 'console_title_search',
        url: 'https://streaming-availability.p.rapidapi.com/v2/search/title',
        method: 'GET',
        params: {
          title: 'Avengers',
          country: 'us',
          show_type: 'all',
          output_language: 'en'
        }
      },
      // 4. 쇼 정보 가져오기 (콘솔에서 제공하는 쇼 정보)
      {
        name: 'console_get_show',
        url: 'https://streaming-availability.p.rapidapi.com/v2/get/show',
        method: 'GET',
        params: {
          country: 'us',
          show_id: 'tt0848228',
          output_language: 'en'
        }
      },
      // 5. 한국 OTT 테스트 (v2 버전)
      {
        name: 'console_korea_netflix_v2',
        url: 'https://streaming-availability.p.rapidapi.com/v2/search/basic',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'netflix',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      },
      // 6. 한국 왓챠 테스트 (v2 버전)
      {
        name: 'console_korea_watcha_v2',
        url: 'https://streaming-availability.p.rapidapi.com/v2/search/basic',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'watcha',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      }
    ];

    interface ConsoleTestResult {
      url: string;
      method: string;
      status: number;
      statusText: string;
      exists: boolean;
      data?: unknown;
      error?: string;
    }

    const results: Record<string, ConsoleTestResult> = {};

    for (const endpoint of consoleEndpoints) {
      try {
        console.log(`콘솔 테스트 중: ${endpoint.name}`);
        
        // URL 파라미터 구성
        const url = new URL(endpoint.url);
        Object.entries(endpoint.params).forEach(([key, value]) => {
          url.searchParams.set(key, value as string);
        });

        console.log('콘솔 호출 URL:', url.toString());

        const response = await fetch(url.toString(), {
          method: endpoint.method,
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        });

        results[endpoint.name] = {
          url: url.toString(),
          method: endpoint.method,
          status: response.status,
          statusText: response.statusText,
          exists: response.status !== 404
        };

        if (response.ok) {
          const data = await response.json();
          results[endpoint.name].data = data;
          console.log(`${endpoint.name} 성공:`, data);
        } else {
          const errorText = await response.text();
          results[endpoint.name].error = errorText;
          console.error(`${endpoint.name} 실패:`, errorText);
        }

      } catch (error) {
        results[endpoint.name] = {
          url: endpoint.url,
          method: endpoint.method,
          status: 0,
          statusText: 'Network Error',
          error: error instanceof Error ? error.message : 'Unknown error',
          exists: false
        };
        console.error(`${endpoint.name} 네트워크 오류:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      api_key_configured: true,
      tests: results,
      message: 'RapidAPI 콘솔 직접 확인 테스트 완료!',
      note: 'v2 엔드포인트를 테스트했습니다. 이 결과로 실제 사용 가능한 엔드포인트를 확인하세요.',
      source: 'RapidAPI 콘솔에서 직접 확인한 엔드포인트'
    });
    
  } catch (error) {
    console.error('RapidAPI 콘솔 직접 확인 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 