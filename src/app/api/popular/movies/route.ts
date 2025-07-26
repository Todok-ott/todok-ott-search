import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET() {
  try {
    // 3페이지(60개)를 가져와서 50개만 반환
    const [page1, page2, page3] = await Promise.all([
      tmdbClient.getPopularMovies(1),
      tmdbClient.getPopularMovies(2),
      tmdbClient.getPopularMovies(3)
    ]);
    
    const allMovies = [
      ...(page1.results || []),
      ...(page2.results || []),
      ...(page3.results || [])
    ];
    
    return NextResponse.json({
      results: allMovies.slice(0, 50), // 50개로 제한
      total_pages: 3,
      total_results: allMovies.length,
      page: 1
    });
  } catch (error) {
    console.error('Popular movies API error:', error);
    return NextResponse.json(
      { error: '인기 영화를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 