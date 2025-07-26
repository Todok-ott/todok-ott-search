import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { enhanceWithKoreanOTTInfo } from '@/lib/koreanOTTs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: '콘텐츠 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`콘텐츠 상세 정보 요청: ${type} ${id}`);

    let contentDetails;
    let ottProviders;

    if (type === 'movie') {
      // 영화 상세 정보
      contentDetails = await tmdbClient.getMovieDetails(parseInt(id));
      ottProviders = await tmdbClient.getMovieWatchProviders(parseInt(id));
    } else {
      // TV 쇼 상세 정보
      contentDetails = await tmdbClient.getTVDetails(parseInt(id));
      ottProviders = await tmdbClient.getTVWatchProviders(parseInt(id));
    }

    // 한국 OTT 정보 추가
    const enhancedContent = await enhanceWithKoreanOTTInfo([contentDetails]);

    const response = {
      ...enhancedContent[0],
      ott_providers: ottProviders,
      media_type: type
    };

    console.log(`콘텐츠 상세 정보 완료: ${type} ${id}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('콘텐츠 상세 정보 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '콘텐츠 정보를 불러올 수 없습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 