import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== 최소 조건 API 테스트 시작 ===');
    
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // 1. 가장 기본적인 조건으로 테스트 (올바른 엔드포인트)
    const basicUrl = new URL('https://streaming-availability.p.rapidapi.com/search/advanced');
    basicUrl.searchParams.set('country', 'kr');
    basicUrl.searchParams.set('service', 'netflix');
    basicUrl.searchParams.set('type', 'movie');
    basicUrl.searchParams.set('output_language', 'ko');
    basicUrl.searchParams.set('order_by', 'original_title');
    basicUrl.searchParams.set('page', '1');

    console.log('기본 테스트 URL:', basicUrl.toString());

    const basicResponse = await fetch(basicUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    console.log('기본 테스트 응답 상태:', basicResponse.status, basicResponse.statusText);
    
    let basicData = null;
    if (basicResponse.ok) {
      basicData = await basicResponse.json();
      console.log('기본 테스트 결과:', basicData);
    } else {
      const errorText = await basicResponse.text();
      console.error('기본 테스트 에러:', errorText);
    }

    // 2. 미국 넷플릭스로 테스트 (올바른 엔드포인트)
    const usUrl = new URL('https://streaming-availability.p.rapidapi.com/search/advanced');
    usUrl.searchParams.set('country', 'us');
    usUrl.searchParams.set('service', 'netflix');
    usUrl.searchParams.set('type', 'movie');
    usUrl.searchParams.set('output_language', 'en');
    usUrl.searchParams.set('order_by', 'original_title');
    usUrl.searchParams.set('page', '1');

    console.log('미국 테스트 URL:', usUrl.toString());

    const usResponse = await fetch(usUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    console.log('미국 테스트 응답 상태:', usResponse.status, usResponse.statusText);
    
    let usData = null;
    if (usResponse.ok) {
      usData = await usResponse.json();
      console.log('미국 테스트 결과:', usData);
    } else {
      const errorText = await usResponse.text();
      console.error('미국 테스트 에러:', errorText);
    }

    // 3. 제목 검색 테스트
    const searchUrl = new URL('https://streaming-availability.p.rapidapi.com/search/title');
    searchUrl.searchParams.set('title', 'Avengers');
    searchUrl.searchParams.set('country', 'us');
    searchUrl.searchParams.set('show_type', 'all');
    searchUrl.searchParams.set('output_language', 'en');

    console.log('제목 검색 URL:', searchUrl.toString());

    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    console.log('제목 검색 응답 상태:', searchResponse.status, searchResponse.statusText);
    
    let searchData = null;
    if (searchResponse.ok) {
      searchData = await searchResponse.json();
      console.log('제목 검색 결과:', searchData);
    } else {
      const errorText = await searchResponse.text();
      console.error('제목 검색 에러:', errorText);
    }

    return NextResponse.json({
      success: true,
      api_key_configured: true,
      test_results: {
        basic_kr_netflix: {
          url: basicUrl.toString(),
          status: basicResponse.status,
          total_results: basicData?.results?.length || 0,
          first_result: basicData?.results?.[0] ? {
            id: basicData.results[0].id,
            title: basicData.results[0].title,
            type: basicData.results[0].type,
            year: basicData.results[0].year
          } : null,
          error: basicResponse.ok ? null : await basicResponse.text()
        },
        us_netflix: {
          url: usUrl.toString(),
          status: usResponse.status,
          total_results: usData?.results?.length || 0,
          first_result: usData?.results?.[0] ? {
            id: usData.results[0].id,
            title: usData.results[0].title,
            type: usData.results[0].type,
            year: usData.results[0].year
          } : null,
          error: usResponse.ok ? null : await usResponse.text()
        },
        title_search: {
          url: searchUrl.toString(),
          status: searchResponse.status,
          total_results: searchData?.results?.length || 0,
          first_result: searchData?.results?.[0] ? {
            id: searchData.results[0].id,
            title: searchData.results[0].title,
            type: searchData.results[0].type,
            year: searchData.results[0].year
          } : null,
          error: searchResponse.ok ? null : await searchResponse.text()
        }
      },
      message: '최소 조건 API 테스트 완료!'
    });
    
  } catch (error) {
    console.error('최소 조건 API 테스트 실패:', error);
    
    return NextResponse.json({
      error: 'API 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_key_configured: !!process.env.STREAMING_AVAILABILITY_API_KEY,
      message: 'API 키를 확인하고 다시 시도해주세요.'
    }, { status: 500 });
  }
} 