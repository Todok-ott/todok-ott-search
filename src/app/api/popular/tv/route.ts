import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET() {
  try {
    // 3페이지(60개)를 가져와서 50개만 반환
    const [page1, page2, page3] = await Promise.all([
      tmdbClient.getPopularTVShows(1),
      tmdbClient.getPopularTVShows(2),
      tmdbClient.getPopularTVShows(3)
    ]);
    
    const allTVShows = [
      ...(page1.results || []),
      ...(page2.results || []),
      ...(page3.results || [])
    ];
    
    return NextResponse.json({
      results: allTVShows.slice(0, 50), // 50개로 제한
      total_pages: 3,
      total_results: allTVShows.length,
      page: 1
    });
  } catch (error) {
    console.error('Popular TV shows API error:', error);
    return NextResponse.json(
      { error: '인기 TV 쇼를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 