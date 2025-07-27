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
    
    if (action === 'validate-id') {
      // ID 검증 테스트
      const id = searchParams.get('id');
      const type = searchParams.get('type') || 'movie';
      
      if (!id) {
        return NextResponse.json({ 
          error: 'ID가 필요합니다.',
          usage: '?action=validate-id&id=123&type=movie'
        }, { status: 400 });
      }
      
      try {
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
          return NextResponse.json({ 
            error: '유효하지 않은 ID입니다.',
            id: id
          }, { status: 400 });
        }
        
        let result;
        if (type === 'movie') {
          result = await tmdbClient.getMovieDetails(numId);
        } else {
          result = await tmdbClient.getTVDetails(numId);
        }
        
        const responseId = (result as any)?.id;
        const title = (result as any)?.title || (result as any)?.name;
        
        return NextResponse.json({
          success: true,
          requested_id: numId,
          response_id: responseId,
          title: title,
          id_match: responseId === numId,
          type: type
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          requested_id: id,
          type: type
        });
      }
    }
    
    return NextResponse.json({ 
      error: '유효하지 않은 액션입니다.',
      available_actions: ['clear-cache', 'test-api', 'validate-id'],
      usage: {
        'clear-cache': '?action=clear-cache',
        'test-api': '?action=test-api&query=test',
        'validate-id': '?action=validate-id&id=123&type=movie'
      }
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