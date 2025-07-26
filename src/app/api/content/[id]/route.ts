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
    const contentId = parseInt(id);
    
    // URL에서 media_type 파라미터 확인
    const url = new URL(request.url);
    const mediaType = url.searchParams.get('type') || 'movie';
    
    console.log('Content API 호출:', { id, contentId, mediaType });
    
    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: '잘못된 콘텐츠 ID입니다.' },
        { status: 400 }
      );
    }

    // 콘텐츠 상세 정보 가져오기
    let contentDetails;
    let ottProviders = null;
    
    try {
      if (mediaType === 'tv') {
        contentDetails = await tmdbClient.getTVDetails(contentId);
      } else {
        contentDetails = await tmdbClient.getMovieDetails(contentId);
      }
      
      console.log('콘텐츠 상세 정보 성공:', contentDetails);
      
      // 데이터 유효성 검사
      const contentDetailsTyped = contentDetails as { title?: string; name?: string };
      if (!contentDetails || (!contentDetailsTyped.title && !contentDetailsTyped.name)) {
        console.error('콘텐츠 상세 정보가 유효하지 않음:', contentDetails);
        return NextResponse.json(
          { error: '콘텐츠 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // 추가 디버깅 정보
      console.log('콘텐츠 데이터 구조:', {
        hasTitle: !!contentDetailsTyped.title,
        hasName: !!contentDetailsTyped.name,
        title: contentDetailsTyped.title,
        name: contentDetailsTyped.name,
        mediaType,
        keys: Object.keys(contentDetails || {}),
        fullData: contentDetails
      });
      
    } catch (error) {
      console.error('콘텐츠 상세 정보 가져오기 실패:', error);
      
      // TMDB API 에러 타입별 처리
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          return NextResponse.json(
            { error: '콘텐츠를 찾을 수 없습니다.' },
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
        { error: '콘텐츠 정보를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // OTT 정보는 선택적으로 가져오기
    try {
      if (mediaType === 'tv') {
        ottProviders = await tmdbClient.getTVWatchProviders(contentId);
      } else {
        ottProviders = await tmdbClient.getMovieWatchProviders(contentId);
      }
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
        const contentTitle = (contentDetails as { title?: string; name?: string }).title || 
                           (contentDetails as { title?: string; name?: string }).name || '';
        combinedOTTInfo = combineOTTData(ottData.results?.KR || ottData.results?.US || {}, contentTitle);
      } catch (error) {
        console.error('OTT 정보 결합 실패:', error);
        // OTT 정보 결합 실패는 무시
      }
    }
    
    // 한국어 콘텐츠인 경우 한국 OTT 정보 추가
    const contentTitle = (contentDetails as { title?: string; name?: string }).title || 
                       (contentDetails as { title?: string; name?: string }).name || '';
    
    if (/[가-힣]/.test(contentTitle)) {
      const koreanProviders = findKoreanOTTProviders(contentTitle);
      if (koreanProviders.length > 0) {
        const contentWithKoreanOTT = {
          ...(contentDetails as Record<string, unknown>),
          media_type: mediaType,
          ott_providers: combinedOTTInfo,
          korean_ott_providers: koreanProviders
        };
        console.log('한국 OTT 정보 추가:', koreanProviders);
        return NextResponse.json(contentWithKoreanOTT);
      }
    }
    
    // 결합된 OTT 정보를 콘텐츠 상세 정보에 추가
    const contentWithOTT = {
      ...(contentDetails as Record<string, unknown>),
      media_type: mediaType,
      ott_providers: combinedOTTInfo
    };
    
    console.log('Content API 응답 완료');
    return NextResponse.json(contentWithOTT);
  } catch (error) {
    console.error('Content details API error:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = '콘텐츠 정보를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('TMDB API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('TMDB API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('TMDB API Error: 404')) {
        errorMessage = '콘텐츠를 찾을 수 없습니다.';
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