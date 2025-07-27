import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== 대안 스트리밍 API 테스트 시작 ===');
    
    // 다른 스트리밍 API 서비스들 테스트
    const alternativeAPIs = [
      // 1. JustWatch API (가능성 있음)
      {
        name: 'justwatch_api',
        url: 'https://apis.justwatch.com/content/locale/ko_KR/popular',
        method: 'GET',
        headers: {},
        description: 'JustWatch API - 한국 인기 콘텐츠'
      },
      // 2. Reelgood API (가능성 있음)
      {
        name: 'reelgood_api',
        url: 'https://api.reelgood.com/v3.0/content/browse/filter',
        method: 'GET',
        headers: {},
        description: 'Reelgood API - 스트리밍 정보'
      },
      // 3. OMDB API (영화 정보)
      {
        name: 'omdb_api',
        url: 'http://www.omdbapi.com/?apikey=YOUR_API_KEY&s=Avengers',
        method: 'GET',
        headers: {},
        description: 'OMDB API - 영화 정보'
      },
      // 4. TVMaze API (TV 시리즈 정보)
      {
        name: 'tvmaze_api',
        url: 'https://api.tvmaze.com/search/shows?q=Avengers',
        method: 'GET',
        headers: {},
        description: 'TVMaze API - TV 시리즈 정보'
      }
    ];

    interface APITestResult {
      name: string;
      url: string;
      method: string;
      status: number;
      statusText: string;
      available: boolean;
      data?: unknown;
      error?: string;
      description: string;
    }

    const results: APITestResult[] = [];

    for (const api of alternativeAPIs) {
      try {
        console.log(`테스트 중: ${api.name}`);
        
        const response = await fetch(api.url, {
          method: api.method,
          headers: api.headers
        });

        const result: APITestResult = {
          name: api.name,
          url: api.url,
          method: api.method,
          status: response.status,
          statusText: response.statusText,
          available: response.ok,
          description: api.description
        };

        if (response.ok) {
          try {
            const data = await response.json();
            result.data = data;
            console.log(`${api.name} 성공:`, data);
          } catch (parseError) {
            result.error = 'JSON 파싱 실패';
            console.error(`${api.name} JSON 파싱 실패:`, parseError);
          }
        } else {
          result.error = `HTTP ${response.status}: ${response.statusText}`;
          console.error(`${api.name} 실패:`, result.error);
        }

        results.push(result);

      } catch (error) {
        results.push({
          name: api.name,
          url: api.url,
          method: api.method,
          status: 0,
          statusText: 'Network Error',
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          description: api.description
        });
        console.error(`${api.name} 네트워크 오류:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      tests: results,
      message: '대안 스트리밍 API 테스트 완료!',
      note: '사용 가능한 API를 찾아서 연동하겠습니다.',
      recommendations: [
        'JustWatch API - 한국 OTT 정보 가능성 높음',
        'Reelgood API - 미국 스트리밍 정보',
        '웹 스크래핑 - 직접 OTT 사이트에서 정보 수집',
        '수동 데이터베이스 - 주요 콘텐츠 OTT 정보 수동 구축'
      ]
    });
    
  } catch (error) {
    console.error('대안 API 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: '다른 방법을 찾아보겠습니다.'
    }, { status: 500 });
  }
} 