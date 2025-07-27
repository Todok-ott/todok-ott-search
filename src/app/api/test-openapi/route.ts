import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== OpenAPI 스펙 기반 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // GitHub 저장소의 OpenAPI 스펙 기반 엔드포인트들
    const openapiEndpoints = [
      // 1. 기본 검색 (OpenAPI 스펙 기반)
      {
        name: 'openapi_search_basic',
        url: 'https://streaming-availability.p.rapidapi.com/search/basic',
        method: 'GET',
        params: {
          country: 'us',
          service: 'netflix',
          type: 'movie',
          output_language: 'en',
          page: '1'
        }
      },
      // 2. 고급 검색 (OpenAPI 스펙 기반)
      {
        name: 'openapi_search_advanced',
        url: 'https://streaming-availability.p.rapidapi.com/search/advanced',
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
      // 3. 제목 검색 (OpenAPI 스펙 기반)
      {
        name: 'openapi_search_title',
        url: 'https://streaming-availability.p.rapidapi.com/search/title',
        method: 'GET',
        params: {
          title: 'Avengers',
          country: 'us',
          show_type: 'all',
          output_language: 'en'
        }
      },
      // 4. 쇼 정보 가져오기 (OpenAPI 스펙 기반)
      {
        name: 'openapi_get_show',
        url: 'https://streaming-availability.p.rapidapi.com/get/show',
        method: 'GET',
        params: {
          country: 'us',
          show_id: 'tt0848228',
          output_language: 'en'
        }
      },
      // 5. 한국 OTT 테스트 (OpenAPI 스펙 기반)
      {
        name: 'openapi_korea_netflix',
        url: 'https://streaming-availability.p.rapidapi.com/search/basic',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'netflix',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      },
      // 6. 한국 왓챠 테스트 (OpenAPI 스펙 기반)
      {
        name: 'openapi_korea_watcha',
        url: 'https://streaming-availability.p.rapidapi.com/search/basic',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'watcha',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      },
      // 7. 한국 티빙 테스트 (OpenAPI 스펙 기반)
      {
        name: 'openapi_korea_tving',
        url: 'https://streaming-availability.p.rapidapi.com/search/basic',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'tving',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      },
      // 8. 한국 웨이브 테스트 (OpenAPI 스펙 기반)
      {
        name: 'openapi_korea_wavve',
        url: 'https://streaming-availability.p.rapidapi.com/search/basic',
        method: 'GET',
        params: {
          country: 'kr',
          service: 'wavve',
          type: 'movie',
          output_language: 'ko',
          page: '1'
        }
      }
    ];

    interface OpenAPITestResult {
      url: string;
      method: string;
      status: number;
      statusText: string;
      exists: boolean;
      data?: unknown;
      error?: string;
    }

    const results: Record<string, OpenAPITestResult> = {};

    for (const endpoint of openapiEndpoints) {
      try {
        console.log(`OpenAPI 테스트 중: ${endpoint.name}`);
        
        // URL 파라미터 구성
        const url = new URL(endpoint.url);
        Object.entries(endpoint.params).forEach(([key, value]) => {
          url.searchParams.set(key, value as string);
        });

        console.log('OpenAPI 호출 URL:', url.toString());

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
      message: 'OpenAPI 스펙 기반 테스트 완료!',
      note: 'GitHub 저장소의 openapi.yaml 파일을 기반으로 테스트했습니다.',
      source: 'https://github.com/movieofthenight/streaming-availability-api/blob/main/openapi.yaml'
    });
    
  } catch (error) {
    console.error('OpenAPI 스펙 기반 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 