import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient, SearchResult } from '@/lib/tmdb';

// TMDB API 응답 타입 정의
type TMDBTestResult = SearchResult | Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'popular';
    
    console.log(`TMDB API 테스트 시작: ${testType}`);
    
    let result: TMDBTestResult;
    
    switch (testType) {
      case 'popular-movies':
        result = await tmdbClient.getPopularMovies(1);
        break;
      case 'popular-tv':
        result = await tmdbClient.getPopularTVShows(1);
        break;
      case 'trending':
        result = await tmdbClient.getTrending('week');
        break;
      case 'search':
        const query = searchParams.get('query') || 'test';
        result = await tmdbClient.searchMulti(query, 1);
        break;
      case 'movie-details':
        const movieId = searchParams.get('id') || '550'; // Fight Club
        result = await tmdbClient.getMovieDetails(movieId) as Record<string, unknown>;
        break;
      case 'tv-details':
        const tvId = searchParams.get('id') || '1399'; // Game of Thrones
        result = await tmdbClient.getTVDetails(tvId) as Record<string, unknown>;
        break;
      default:
        return NextResponse.json({ 
          error: '유효하지 않은 테스트 타입입니다.',
          available_types: ['popular-movies', 'popular-tv', 'trending', 'search', 'movie-details', 'tv-details']
        }, { status: 400 });
    }
    
    console.log(`TMDB API 테스트 완료: ${testType}`);
    
    // SearchResult 타입인지 확인
    const searchResult = result as SearchResult;
    const hasResults = 'results' in result && Array.isArray(searchResult.results);
    
    return NextResponse.json({
      success: true,
      test_type: testType,
      result_count: hasResults ? searchResult.results.length : 0,
      sample_data: hasResults ? searchResult.results.slice(0, 2) : result
    });
    
  } catch (error) {
    console.error('TMDB API 테스트 오류:', error);
    return NextResponse.json(
      { 
        error: 'TMDB API 테스트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 