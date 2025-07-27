import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { enhanceWithKoreanOTTInfo } from '@/lib/koreanOTTs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';
    const { id } = await params;

    // ID 검증
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: '콘텐츠 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // ID가 숫자인지 확인
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json(
        { error: '유효하지 않은 콘텐츠 ID입니다.' },
        { status: 400 }
      );
    }

    console.log(`콘텐츠 상세 정보 요청: ${type} ${numId}`);

    let contentDetails;
    let ottProviders;

    try {
      if (type === 'movie') {
        // 영화 상세 정보
        contentDetails = await tmdbClient.getMovieDetails(numId);
        ottProviders = await tmdbClient.getMovieWatchProviders(numId);
      } else {
        // TV 쇼 상세 정보
        contentDetails = await tmdbClient.getTVDetails(numId);
        ottProviders = await tmdbClient.getTVWatchProviders(numId);
      }
    } catch (apiError) {
      console.error('TMDB API 오류:', apiError);
      
      // 404 오류 처리
      if (apiError instanceof Error && apiError.message.includes('찾을 수 없습니다')) {
        return NextResponse.json(
          { error: '요청한 콘텐츠를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      throw apiError;
    }

    // 응답 데이터 검증
    if (!contentDetails || typeof contentDetails !== 'object') {
      return NextResponse.json(
        { error: '콘텐츠 정보를 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 필수 필드 확인
    const content = contentDetails as any;
    if (!content.id || (!content.title && !content.name)) {
      return NextResponse.json(
        { error: '유효하지 않은 콘텐츠 정보입니다.' },
        { status: 500 }
      );
    }

    // 한국 OTT 정보 추가
    let enhancedContent;
    try {
      enhancedContent = await enhanceWithKoreanOTTInfo([contentDetails]);
    } catch (ottError) {
      console.error('한국 OTT 정보 추가 실패:', ottError);
      // OTT 정보 추가 실패해도 기본 콘텐츠 정보는 반환
      enhancedContent = [contentDetails];
    }

    const response = {
      ...enhancedContent[0],
      ott_providers: ottProviders,
      media_type: type
    };

    console.log(`콘텐츠 상세 정보 완료: ${type} ${numId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('콘텐츠 상세 정보 API 오류:', error);
    
    // 네트워크 오류 처리
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 503 }
      );
    }
    
    // 타임아웃 오류 처리
    if (error instanceof Error && error.message.includes('시간 초과')) {
      return NextResponse.json(
        { error: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        error: '콘텐츠 정보를 불러올 수 없습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 