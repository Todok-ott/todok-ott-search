import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== RapidAPI 공식 문서 기반 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // RapidAPI 공식 문서에서 확인한 실제 엔드포인트들
    const officialEndpoints = [
      // 1. Search 엔드포인트 (공식 문서 기반)
      {
        name: 'search_official',
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
      // 2. Search by Title 엔드포인트 (공식 문서 기반)
      {
        name: 'search_title_official',
        url: 'https://streaming-availability.p.rapidapi.com/search/title',
        method: 'GET',
        params: {
          title: 'Avengers',
          country: 'us',
          show_type: 'all',
          output_language: 'en'
        }
      },
      // 3. Get Show 엔드포인트 (공식 문서 기반)
      {
        name: 'get_show_official',
        url: 'https://streaming-availability.p.rapidapi.com/get/show',
        method: 'GET',
        params: {
          country: 'us',
          show_id: 'tt0848228', // Avengers ID
          output_language: 'en'
        }
      },
      // 4. 한국 OTT 테스트 (공식 문서 기반)
      {
        name: 'korea_netflix',
        url: 'https://streaming-availability.p.rapidapi.com/search',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'netflix',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      },
      // 5. 한국 왓챠 테스트 (공식 문서 기반)
      {
        name: 'korea_watcha',
        url: 'https://streaming-availability.p.rapidapi.com/search',
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

    interface OfficialTestResult {
      url: string;
      method: string;
      status: number;
      statusText: string;
      exists: boolean;
      data?: unknown;
      error?: string;
    }

    const results: Record<string, OfficialTestResult> = {};

    for (const endpoint of officialEndpoints) {
      try {
        console.log(`공식 문서 테스트 중: ${endpoint.name}`);
        
        // URL 파라미터 구성
        const url = new URL(endpoint.url);
        Object.entries(endpoint.params).forEach(([key, value]) => {
          url.searchParams.set(key, value as string);
        });

        console.log('공식 문서 호출 URL:', url.toString());

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
      message: 'RapidAPI 공식 문서 기반 테스트 완료!',
      note: '이 결과를 바탕으로 실제 사용 가능한 엔드포인트를 확인하세요.',
      source: 'https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability'
    });
    
  } catch (error) {
    console.error('RapidAPI 공식 문서 기반 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 