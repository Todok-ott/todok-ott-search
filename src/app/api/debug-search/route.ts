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
    
    const searchResults = await tmdbClient.searchMulti(query);
    
    console.log('검색 결과:', searchResults);
    
    return NextResponse.json({
      query,
      results: searchResults?.results?.slice(0, 10) || [],
      total: searchResults?.total_results || 0
    });
    
  } catch (error) {
    console.error('디버그 검색 에러:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 