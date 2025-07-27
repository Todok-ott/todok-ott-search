import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear-cache') {
      // 캐시 클리어
      tmdbClient.clearCache();
      return NextResponse.json({ 
        success: true, 
        message: 'TMDB 캐시가 클리어되었습니다.' 
      });
    }
    
    if (action === 'test-api') {
      // API 테스트
      const query = searchParams.get('query') || 'test';
      const results = await tmdbClient.searchMulti(query, 1);
      return NextResponse.json({ 
        success: true, 
        results: results.results.slice(0, 5) // 처음 5개만 반환
      });
    }
    
    return NextResponse.json({ 
      error: '유효하지 않은 액션입니다.',
      available_actions: ['clear-cache', 'test-api']
    }, { status: 400 });
    
  } catch (error) {
    console.error('디버그 API 오류:', error);
    return NextResponse.json(
      { 
        error: '디버그 작업 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 