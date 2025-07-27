import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: '검색어가 필요합니다' }, { status: 400 });
    }
    
    console.log('=== 디버그 검색 시작 ===');
    console.log('검색어:', query);
    
    // 여러 검색어로 테스트
    const searchQueries = [
      query,
      query.replace('THE ANOMATION', 'THE ANIMATION'), // 오타 수정
      'Nukitashi',
      'Nukitashi THE ANIMATION',
      '누키타시',
      '누키타시 THE ANIMATION'
    ];
    
    const allResults = [];
    
    for (const searchQuery of searchQueries) {
      console.log(`검색 시도: "${searchQuery}"`);
      const searchResults = await tmdbClient.searchMulti(searchQuery);
      
      if (searchResults?.results?.length > 0) {
        allResults.push({
          searchQuery,
          results: searchResults.results.slice(0, 5),
          total: searchResults.total_results
        });
        console.log(`"${searchQuery}" 검색 성공: ${searchResults.total_results}개 결과`);
      } else {
        console.log(`"${searchQuery}" 검색 실패: 결과 없음`);
      }
    }
    
    return NextResponse.json({
      originalQuery: query,
      searchQueries,
      successfulResults: allResults,
      totalSuccessful: allResults.length
    });
    
  } catch (error) {
    console.error('디버그 검색 에러:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 