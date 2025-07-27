import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { debugOTTInfo, hasOTT, hasAnyOTT } from '@/lib/ottUtils';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const movieId = url.searchParams.get('movieId');
    const tvId = url.searchParams.get('tvId');
    
    console.log('=== OTT 테스트 시작 ===');
    
    const results = [];
    
    // 영화 OTT 정보 테스트
    if (movieId) {
      console.log(`영화 OTT 테스트 (ID: ${movieId})`);
      try {
        const providers = await tmdbClient.getMovieWatchProviders(parseInt(movieId));
        const providerData = providers as { results?: { KR?: unknown } };
        const ottInfo = providerData.results?.KR || null;
        
        const testResult = {
          id: movieId,
          media_type: 'movie',
          title: `영화 ID: ${movieId}`,
          ott_providers: ottInfo
        };
        
        debugOTTInfo(testResult);
        
        results.push({
          type: 'movie',
          id: movieId,
          ott_providers: ottInfo,
          hasOTT: hasOTT(testResult),
          hasAnyOTT: hasAnyOTT(testResult)
        });
      } catch (error) {
        console.error('영화 OTT 정보 가져오기 실패:', error);
        results.push({
          type: 'movie',
          id: movieId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // TV OTT 정보 테스트
    if (tvId) {
      console.log(`TV OTT 테스트 (ID: ${tvId})`);
      try {
        const providers = await tmdbClient.getTVWatchProviders(parseInt(tvId));
        const providerData = providers as { results?: { KR?: unknown } };
        const ottInfo = providerData.results?.KR || null;
        
        const testResult = {
          id: tvId,
          media_type: 'tv',
          title: `TV ID: ${tvId}`,
          ott_providers: ottInfo
        };
        
        debugOTTInfo(testResult);
        
        results.push({
          type: 'tv',
          id: tvId,
          ott_providers: ottInfo,
          hasOTT: hasOTT(testResult),
          hasAnyOTT: hasAnyOTT(testResult)
        });
      } catch (error) {
        console.error('TV OTT 정보 가져오기 실패:', error);
        results.push({
          type: 'tv',
          id: tvId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 로컬 데이터 테스트
    const localTestData = {
      id: 1,
      title: '기생충',
      ottPlatforms: ['넷플릭스', '티빙'],
      local_data: true
    };
    
    debugOTTInfo(localTestData);
    
    results.push({
      type: 'local',
      title: '기생충',
      ottPlatforms: ['넷플릭스', '티빙'],
      hasOTT: hasOTT(localTestData),
      hasAnyOTT: hasAnyOTT(localTestData)
    });
    
    console.log('=== OTT 테스트 완료 ===');
    
    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        withOTT: results.filter(r => r.hasOTT).length,
        withAnyOTT: results.filter(r => r.hasAnyOTT).length
      }
    });
    
  } catch (error) {
    console.error('OTT 테스트 에러:', error);
    return NextResponse.json(
      { error: '테스트 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 