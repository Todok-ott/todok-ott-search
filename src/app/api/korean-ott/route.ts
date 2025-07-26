import { NextRequest, NextResponse } from 'next/server';
import { KOREAN_OTT_PLATFORMS, findKoreanOTTProviders } from '@/lib/koreanOTTs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const type = searchParams.get('type') || 'all';

    if (!title) {
      return NextResponse.json({
        error: '제목 파라미터가 필요합니다.',
        platforms: KOREAN_OTT_PLATFORMS
      });
    }

    console.log('한국 OTT API 호출:', { title, type });

    // 제목에 대한 한국 OTT 정보 검색
    const koreanProviders = findKoreanOTTProviders(title);
    
    // 타입별 필터링
    let filteredProviders = koreanProviders;
    if (type !== 'all') {
      filteredProviders = koreanProviders.filter(provider => {
        switch (type) {
          case 'movie':
            return ['넷플릭스', '디즈니플러스', '웨이브', '왓챠'].includes(provider.name);
          case 'drama':
            return ['넷플릭스', '디즈니플러스', '웨이브', '티빙', '왓챠'].includes(provider.name);
          case 'variety':
            return ['티빙', '웨이브', '왓챠'].includes(provider.name);
          case 'animation':
            return ['라프텔', '넷플릭스', '디즈니플러스'].includes(provider.name);
          default:
            return true;
        }
      });
    }

    const response = {
      title,
      type,
      providers: filteredProviders,
      all_platforms: KOREAN_OTT_PLATFORMS,
      total_providers: filteredProviders.length,
      search_success: filteredProviders.length > 0
    };

    console.log('한국 OTT API 응답:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Korean OTT API error:', error);
    return NextResponse.json(
      { 
        error: '한국 OTT 정보를 불러오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 