import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== API 엔드포인트 테스트 v2 시작 ===');
    
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
      // 1. 다른 가능한 검색 엔드포인트들
      { name: 'v2_search', url: `${baseUrl}/v2/search` },
      { name: 'v1_search', url: `${baseUrl}/v1/search` },
      { name: 'api_search', url: `${baseUrl}/api/search` },
      
      // 2. 다른 제목 검색 엔드포인트들
      { name: 'v2_search_title', url: `${baseUrl}/v2/search/title` },
      { name: 'v1_search_title', url: `${baseUrl}/v1/search/title` },
      { name: 'api_search_title', url: `${baseUrl}/api/search/title` },
      
      // 3. 다른 상세정보 엔드포인트들
      { name: 'v2_get_show', url: `${baseUrl}/v2/get/show` },
      { name: 'v1_get_show', url: `${baseUrl}/v1/get/show` },
      { name: 'api_get_show', url: `${baseUrl}/api/get/show` },
      
      // 4. 다른 기본 엔드포인트들
      { name: 'v2', url: `${baseUrl}/v2` },
      { name: 'v1', url: `${baseUrl}/v1` },
      { name: 'api', url: `${baseUrl}/api` },
      
      // 5. 다른 가능한 엔드포인트들
      { name: 'search_by_id', url: `${baseUrl}/search/by-id` },
      { name: 'search_by_imdb', url: `${baseUrl}/search/by-imdb` },
      { name: 'search_by_tmdb', url: `${baseUrl}/search/by-tmdb` },
      { name: 'search_by_title_exact', url: `${baseUrl}/search/by-title-exact` },
      
      // 6. 다른 상세정보 엔드포인트들
      { name: 'get_movie', url: `${baseUrl}/get/movie` },
      { name: 'get_series', url: `${baseUrl}/get/series` },
      { name: 'get_content', url: `${baseUrl}/get/content` },
      
      // 7. 다른 기본 엔드포인트들
      { name: 'movies_by_country', url: `${baseUrl}/movies/by-country` },
      { name: 'series_by_country', url: `${baseUrl}/series/by-country` },
      { name: 'content_by_country', url: `${baseUrl}/content/by-country` },
      
      // 8. 다른 검색 엔드포인트들
      { name: 'search_by_genre', url: `${baseUrl}/search/by-genre` },
      { name: 'search_by_year', url: `${baseUrl}/search/by-year` },
      { name: 'search_by_rating', url: `${baseUrl}/search/by-rating` },
      
      // 9. 다른 상세정보 엔드포인트들
      { name: 'get_streaming_info', url: `${baseUrl}/get/streaming-info` },
      { name: 'get_availability', url: `${baseUrl}/get/availability` },
      { name: 'get_providers', url: `${baseUrl}/get/providers` },
      
      // 10. 다른 기본 엔드포인트들
      { name: 'streaming_by_country', url: `${baseUrl}/streaming/by-country` },
      { name: 'availability_by_country', url: `${baseUrl}/availability/by-country` },
      { name: 'providers_by_country', url: `${baseUrl}/providers/by-country` }
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
      message: 'API 엔드포인트 테스트 v2 완료!'
    });
    
  } catch (error) {
    console.error('API 엔드포인트 테스트 v2 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 