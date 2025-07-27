import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== 수동 API 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // 가장 기본적인 테스트
    const url = new URL('https://streaming-availability.p.rapidapi.com/search/basic');
    url.searchParams.set('country', 'us');
    url.searchParams.set('service', 'netflix');
    url.searchParams.set('type', 'movie');
    url.searchParams.set('output_language', 'en');
    url.searchParams.set('page', '1');

    console.log('테스트 URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    console.log('응답 상태:', response.status, response.statusText);
    
    let data = null;
    let error = null;
    
    if (response.ok) {
      data = await response.json();
      console.log('API 응답:', data);
    } else {
      error = await response.text();
      console.error('API 에러:', error);
    }

    return NextResponse.json({
      success: true,
      api_key_configured: true,
      test_url: url.toString(),
      response_status: response.status,
      response_status_text: response.statusText,
      total_results: data?.results?.length || 0,
      first_result: data?.results?.[0] ? {
        id: data.results[0].id,
        title: data.results[0].title,
        type: data.results[0].type,
        year: data.results[0].year
      } : null,
      error: error,
      message: '수동 API 테스트 완료!'
    });
    
  } catch (error) {
    console.error('수동 API 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 