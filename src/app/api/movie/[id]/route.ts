import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { enhanceWithKoreanOTTInfo } from '@/lib/koreanOTTs';

// TMDB 콘텐츠 상세 정보 타입 정의
interface TMDBContentDetails {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres?: Array<{ id: number; name: string }>;
  [key: string]: unknown; // 추가 속성 허용
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { id } = await params;

    // ID 검증
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: '영화 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // ID가 숫자인지 확인
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json(
        { error: '유효하지 않은 영화 ID입니다.' },
        { status: 400 }
      );
    }

    console.log(`영화 상세 정보 요청: ${numId}`);

    let contentDetails: TMDBContentDetails;
    let ottProviders;

    try {
      // 영화 상세 정보
      contentDetails = await tmdbClient.getMovieDetails(numId) as TMDBContentDetails;
      ottProviders = await tmdbClient.getMovieWatchProviders(numId);
    } catch (apiError) {
      console.error('TMDB API 오류:', apiError);
      
      // 404 오류 처리
      if (apiError instanceof Error && apiError.message.includes('찾을 수 없습니다')) {
        return NextResponse.json(
          { error: '영화 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // ID 불일치 오류 처리
      if (apiError instanceof Error && apiError.message.includes('ID가 일치하지 않습니다')) {
        console.error('ID 불일치 오류 발생, 캐시 클리어 후 재시도');
        tmdbClient.clearCache();
        
        // 재시도
        try {
          contentDetails = await tmdbClient.getMovieDetails(numId) as TMDBContentDetails;
          ottProviders = await tmdbClient.getMovieWatchProviders(numId);
        } catch (retryError) {
          return NextResponse.json(
            { error: '영화 정보를 불러올 수 없습니다.' },
            { status: 500 }
          );
        }
      } else {
        throw apiError;
      }
    }

    // 응답 데이터 검증
    if (!contentDetails || typeof contentDetails !== 'object') {
      return NextResponse.json(
        { error: '영화 정보를 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 필수 필드 확인
    if (!contentDetails.id || (!contentDetails.title && !contentDetails.name)) {
      return NextResponse.json(
        { error: '유효하지 않은 영화 정보입니다.' },
        { status: 500 }
      );
    }

    // ID 일치 확인
    if (contentDetails.id !== numId) {
      console.error(`ID 불일치: 요청 ${numId}, 응답 ${contentDetails.id}`);
      return NextResponse.json(
        { error: '요청한 영화와 다른 영화 정보가 반환되었습니다.' },
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
      media_type: 'movie'
    };

    console.log(`영화 상세 정보 완료: ${numId} - ${contentDetails.title || contentDetails.name}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('영화 상세 정보 API 오류:', error);
    
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
        error: '영화 정보를 불러올 수 없습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 