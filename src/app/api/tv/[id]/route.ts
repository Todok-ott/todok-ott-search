import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { combineOTTData } from '@/lib/ottUtils';

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
    } catch (error) {
      console.error('TV 상세 정보 가져오기 실패:', error);
      return NextResponse.json(
        { error: 'TV 쇼 정보를 찾을 수 없습니다.' },
        { status: 404 }
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
    let combinedOTTInfo: any[] = [];
    if (ottProviders) {
      try {
        const ottData = ottProviders as { results?: { KR?: unknown; US?: unknown } };
        const tvTitle = (tvDetails as { name?: string }).name || '';
        combinedOTTInfo = combineOTTData(ottData.results?.KR || ottData.results?.US || {}, tvTitle);
      } catch (error) {
        console.error('OTT 정보 결합 실패:', error);
        // OTT 정보 결합 실패는 무시
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