import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== API 엔드포인트 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    const baseUrl = 'https://streaming-availability.p.rapidapi.com';
    const headers = {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
    };

    const endpoints = [
      // 1. 기본 검색 엔드포인트들
      { name: 'search_basic', url: `${baseUrl}/search/basic` },
      { name: 'search_advanced', url: `${baseUrl}/search/advanced` },
      { name: 'search', url: `${baseUrl}/search` },
      
      // 2. 제목 검색 엔드포인트들
      { name: 'search_title', url: `${baseUrl}/search/title` },
      { name: 'search_by_title', url: `${baseUrl}/search/by-title` },
      
      // 3. 작품 상세정보 엔드포인트들
      { name: 'get_show', url: `${baseUrl}/get/show` },
      { name: 'show', url: `${baseUrl}/show` },
      
      // 4. 기타 가능한 엔드포인트들
      { name: 'movies', url: `${baseUrl}/movies` },
      { name: 'series', url: `${baseUrl}/series` },
      { name: 'content', url: `${baseUrl}/content` },
      { name: 'streaming', url: `${baseUrl}/streaming` }
    ];

    interface EndpointResult {
      url: string;
      status: number;
      statusText: string;
      exists: boolean;
      data?: unknown;
      error?: string;
    }

    const results: Record<string, EndpointResult> = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`테스트 중: ${endpoint.name} - ${endpoint.url}`);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers
        });

        results[endpoint.name] = {
          url: endpoint.url,
          status: response.status,
          statusText: response.statusText,
          exists: response.status !== 404
        };

        if (response.ok) {
          const data = await response.json();
          results[endpoint.name].data = data;
        } else {
          const errorText = await response.text();
          results[endpoint.name].error = errorText;
        }

      } catch (error) {
        results[endpoint.name] = {
          url: endpoint.url,
          status: 0,
          statusText: 'Network Error',
          error: error instanceof Error ? error.message : 'Unknown error',
          exists: false
        };
      }
    }

    return NextResponse.json({
      success: true,
      api_key_configured: true,
      endpoints: results,
      message: 'API 엔드포인트 테스트 완료!'
    });
    
  } catch (error) {
    console.error('API 엔드포인트 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 