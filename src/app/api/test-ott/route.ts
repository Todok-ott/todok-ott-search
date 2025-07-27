import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET() {
  try {
    console.log('OTT 테스트 API 시작');
    
    // 테스트할 영화 ID들 (인기 영화들)
    const testMovieIds = [93405, 299536, 550, 13, 155, 238, 278];
    
    const results = [];
    
    for (const movieId of testMovieIds) {
      try {
        // 영화 정보 가져오기
        const movieDetails = await tmdbClient.getMovieDetails(movieId);
        const ottData = await tmdbClient.getMovieWatchProviders(movieId);
        
        console.log(`영화 ${movieId} (${movieDetails.title}) OTT 데이터:`, {
          movieId,
          title: movieDetails.title,
          ottData: ottData,
          hasKR: !!ottData?.KR,
          krData: ottData?.KR,
          flatrate: ottData?.KR?.flatrate,
          rent: ottData?.KR?.rent,
          buy: ottData?.KR?.buy
        });
        
        results.push({
          movieId,
          title: movieDetails.title,
          ottData: ottData
        });
      } catch (error) {
        console.log(`영화 ${movieId} 처리 실패:`, error);
      }
    }
    
    return NextResponse.json({
      message: 'OTT 테스트 완료',
      results: results
    });
    
  } catch (error) {
    console.error('OTT 테스트 API 오류:', error);
    return NextResponse.json(
      { error: 'OTT 테스트 실패' },
      { status: 500 }
    );
  }
} 