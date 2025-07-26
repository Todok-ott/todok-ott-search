import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { combineOTTInfo } from '@/lib/ottUtils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tvId = parseInt(params.id);
    
    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: '잘못된 TV 쇼 ID입니다.' },
        { status: 400 }
      );
    }

    // TV 상세 정보와 OTT 제공업체 정보를 병렬로 가져오기
    const [tvDetails, ottProviders] = await Promise.all([
      tmdbClient.getTVDetails(tvId),
      tmdbClient.getTVWatchProviders(tvId)
    ]);
    
    // OTT 정보 결합
    const combinedOTTInfo = combineOTTInfo(ottProviders.results?.KR || ottProviders.results?.US || {});
    
    // 결합된 OTT 정보를 TV 상세 정보에 추가
    const tvWithOTT = {
      ...tvDetails,
      ott_providers: combinedOTTInfo
    };
    
    return NextResponse.json(tvWithOTT);
  } catch (error) {
    console.error('TV details API error:', error);
    return NextResponse.json(
      { error: 'TV 쇼 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 