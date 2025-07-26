import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { combineOTTData, OTTProvider } from '@/lib/ottUtils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id);
    
    console.log('Movie API 호출:', { id, movieId });
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: '잘못된 영화 ID입니다.' },
        { status: 400 }
      );
    }

    // 영화 상세 정보만 먼저 가져오기 (OTT 정보는 선택적)
    let movieDetails;
    let ottProviders = null;
    
    try {
      movieDetails = await tmdbClient.getMovieDetails(movieId);
      console.log('영화 상세 정보 성공:', movieDetails);
      
      // 데이터 유효성 검사 추가
      const movieDetailsTyped = movieDetails as { title?: string; name?: string };
      if (!movieDetails || (!movieDetailsTyped.title && !movieDetailsTyped.name)) {
        console.error('영화 상세 정보가 유효하지 않음:', movieDetails);
        return NextResponse.json(
          { error: '영화 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // 추가 디버깅 정보
      console.log('영화 데이터 구조:', {
        hasTitle: !!movieDetailsTyped.title,
        hasName: !!movieDetailsTyped.name,
        title: movieDetailsTyped.title,
        name: movieDetailsTyped.name,
        keys: Object.keys(movieDetails || {})
      });
      
    } catch (error) {
      console.error('영화 상세 정보 가져오기 실패:', error);
      
      // TMDB API 에러 타입별 처리
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          return NextResponse.json(
            { error: '영화를 찾을 수 없습니다.' },
            { status: 404 }
          );
        } else if (error.message.includes('401')) {
          return NextResponse.json(
            { error: 'API 키가 유효하지 않습니다.' },
            { status: 401 }
          );
        } else if (error.message.includes('429')) {
          return NextResponse.json(
            { error: 'API 요청 한도를 초과했습니다.' },
            { status: 429 }
          );
        } else if (error.message.includes('timeout')) {
          return NextResponse.json(
            { error: 'API 요청 시간 초과. 잠시 후 다시 시도해주세요.' },
            { status: 408 }
          );
        }
      }
      
      return NextResponse.json(
        { error: '영화 정보를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // OTT 정보는 선택적으로 가져오기
    try {
      ottProviders = await tmdbClient.getMovieWatchProviders(movieId);
      console.log('OTT 정보 성공:', ottProviders);
    } catch (error) {
      console.error('OTT 정보 가져오기 실패:', error);
      // OTT 정보 실패는 치명적이지 않음
    }
    
    // OTT 정보 결합 (실패해도 기본 정보는 반환)
    let combinedOTTInfo: OTTProvider[] = [];
    if (ottProviders) {
      try {
        const ottData = ottProviders as { results?: { KR?: unknown; US?: unknown } };
        const movieTitle = (movieDetails as { title?: string }).title || '';
        combinedOTTInfo = combineOTTData(ottData.results?.KR || ottData.results?.US || {}, movieTitle);
      } catch (error) {
        console.error('OTT 정보 결합 실패:', error);
        // OTT 정보 결합 실패는 무시
      }
    }
    
    // 결합된 OTT 정보를 영화 상세 정보에 추가
    const movieWithOTT = {
      ...(movieDetails as Record<string, unknown>),
      ott_providers: combinedOTTInfo
    };
    
    console.log('Movie API 응답 완료');
    return NextResponse.json(movieWithOTT);
  } catch (error) {
    console.error('Movie details API error:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = '영화 정보를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('TMDB API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('TMDB API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('TMDB API Error: 404')) {
        errorMessage = '영화를 찾을 수 없습니다.';
        statusCode = 404;
      } else if (error.message.includes('TMDB API Error: 429')) {
        errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 429;
      } else {
        errorMessage = `API 오류: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
} 