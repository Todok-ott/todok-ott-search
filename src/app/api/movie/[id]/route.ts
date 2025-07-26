import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { combineOTTData } from '@/lib/ottUtils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: '잘못된 영화 ID입니다.' },
        { status: 400 }
      );
    }

    // 영화 상세 정보와 OTT 제공업체 정보를 병렬로 가져오기
    const [movieDetails, ottProviders] = await Promise.all([
      tmdbClient.getMovieDetails(movieId),
      tmdbClient.getMovieWatchProviders(movieId)
    ]);
    
    // OTT 정보 결합
    const ottData = ottProviders as { results?: { KR?: unknown; US?: unknown } };
    const movieTitle = (movieDetails as { title?: string }).title || '';
    const combinedOTTInfo = combineOTTData(ottData.results?.KR || ottData.results?.US || {}, movieTitle);
    
    // 결합된 OTT 정보를 영화 상세 정보에 추가
    const movieWithOTT = {
      ...(movieDetails as Record<string, unknown>),
      ott_providers: combinedOTTInfo
    };
    
    return NextResponse.json(movieWithOTT);
  } catch (error) {
    console.error('Movie details API error:', error);
    return NextResponse.json(
      { error: '영화 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 