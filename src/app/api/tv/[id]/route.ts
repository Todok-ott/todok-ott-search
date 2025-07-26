import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { combineOTTData, OTTProvider } from '@/lib/ottUtils';
import { findKoreanOTTProviders } from '@/lib/koreanOTTs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tvId = parseInt(id);
    
    console.log('TV API 호출:', { id, tvId });
    
    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: '잘못된 TV 쇼 ID입니다.' },
        { status: 400 }
      );
    }

    // TV 상세 정보만 먼저 가져오기 (OTT 정보는 선택적)
    let tvDetails;
    let ottProviders = null;
    
    try {
      tvDetails = await tmdbClient.getTVDetails(tvId);
      console.log('TV 상세 정보 성공:', tvDetails);
      
      // 데이터 유효성 검사 추가
      const tvDetailsTyped = tvDetails as { name?: string };
      if (!tvDetails || !tvDetailsTyped.name) {
        console.error('TV 상세 정보가 유효하지 않음:', tvDetails);
        return NextResponse.json(
          { error: 'TV 쇼 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('TV 상세 정보 가져오기 실패:', error);
      
      // TMDB API 에러 타입별 처리
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          return NextResponse.json(
            { error: 'TV 쇼를 찾을 수 없습니다.' },
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
        }
      }
      
      return NextResponse.json(
        { error: 'TV 쇼 정보를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // OTT 정보는 선택적으로 가져오기
    try {
      ottProviders = await tmdbClient.getTVWatchProviders(tvId);
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
        const showTitle = (tvDetails as { name?: string }).name || '';
        const firstAirDate = (tvDetails as { first_air_date?: string }).first_air_date;
        const genres = (tvDetails as { genres?: Array<{ name: string }> }).genres?.map(g => g.name);
        
        combinedOTTInfo = combineOTTData(ottData.results?.KR || ottData.results?.US || {}, showTitle, genres, firstAirDate);
      } catch (error) {
        console.error('OTT 정보 결합 실패:', error);
        // OTT 정보 결합 실패는 무시
      }
    }
    
    // 한국어 콘텐츠인 경우 한국 OTT 정보 추가
    const showTitle = (tvDetails as { name?: string }).name || '';
    const firstAirDate = (tvDetails as { first_air_date?: string }).first_air_date;
    
    // 개봉일 확인 - 아직 개봉하지 않은 드라마는 OTT 정보 추가하지 않음
    const isReleased = firstAirDate && new Date(firstAirDate) <= new Date();
    
    console.log('OTT 정보 필터링:', {
      title: showTitle,
      firstAirDate,
      isReleased,
      hasKoreanTitle: /[가-힣]/.test(showTitle),
      hasOTTInfo: combinedOTTInfo.length > 0
    });
    
    if (/[가-힣]/.test(showTitle) && combinedOTTInfo.length === 0 && isReleased) {
      const koreanProviders = findKoreanOTTProviders(showTitle);
      if (koreanProviders.length > 0) {
        // 한국 OTT 정보를 별도 필드로 추가
        const showWithKoreanOTT = {
          ...(tvDetails as Record<string, unknown>),
          ott_providers: combinedOTTInfo,
          korean_ott_providers: koreanProviders
        };
        console.log('한국 OTT 정보 추가:', koreanProviders);
        return NextResponse.json(showWithKoreanOTT);
      }
    }
    
    // 한국어 콘텐츠인 경우 기본 OTT 정보 추가 (개봉된 드라마만)
    if (/[가-힣]/.test(showTitle) && isReleased) {
      const koreanProviders = findKoreanOTTProviders(showTitle);
      if (koreanProviders.length > 0) {
        const showWithKoreanOTT = {
          ...(tvDetails as Record<string, unknown>),
          ott_providers: combinedOTTInfo,
          korean_ott_providers: koreanProviders
        };
        console.log('한국 OTT 정보 추가 (기본):', koreanProviders);
        return NextResponse.json(showWithKoreanOTT);
      }
    }
    
    // 결합된 OTT 정보를 TV 상세 정보에 추가
    const tvWithOTT = {
      ...(tvDetails as Record<string, unknown>),
      ott_providers: combinedOTTInfo
    };
    
    console.log('TV API 응답 완료');
    return NextResponse.json(tvWithOTT);
  } catch (error) {
    console.error('TV details API error:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = 'TV 쇼 정보를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('TMDB API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('TMDB API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('TMDB API Error: 404')) {
        errorMessage = 'TV 쇼를 찾을 수 없습니다.';
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