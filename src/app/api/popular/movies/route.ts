import { NextResponse } from 'next/server';
import { dataLoader } from '@/lib/dataLoader';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';
import { filterByOTT } from '@/lib/ottUtils';

export async function GET() {
  try {
    console.log('인기 영화 API 호출 시작');
    
    // 로컬 데이터에서 영화 가져오기
    const localMovies = dataLoader.getAllMovies();
    console.log('로컬 영화 데이터 로드:', localMovies.length);
    
    // Streaming Availability API로 OTT 정보 추가
    const moviesWithOTT = [];
    
    for (const movie of localMovies.slice(0, 20)) { // 성능을 위해 20개만 처리
      try {
        const streamingData = await streamingAvailabilityClient.searchByTitle(movie.title);
        
        if (streamingData && streamingData.result) {
          const ottProviders = streamingAvailabilityClient.convertToOTTProviders(streamingData);
          
          const movieWithOTT = {
            id: movie.id,
            title: movie.title,
            media_type: 'movie',
            overview: movie.overview || `${movie.title} (${movie.year})`,
            release_date: `${movie.year}-01-01`,
            vote_average: movie.rating || 0,
            popularity: movie.rating || 0,
            poster_path: movie.posterUrl,
            ott_providers: ottProviders,
            local_data: true
          };
          
          moviesWithOTT.push(movieWithOTT);
        } else {
          // OTT 정보가 없어도 기본 정보는 포함
          const movieWithOTT = {
            id: movie.id,
            title: movie.title,
            media_type: 'movie',
            overview: movie.overview || `${movie.title} (${movie.year})`,
            release_date: `${movie.year}-01-01`,
            vote_average: movie.rating || 0,
            popularity: movie.rating || 0,
            poster_path: movie.posterUrl,
            ott_providers: { KR: { flatrate: [], buy: [], rent: [] } },
            local_data: true
          };
          
          moviesWithOTT.push(movieWithOTT);
        }
      } catch (error) {
        console.error(`영화 "${movie.title}" OTT 정보 가져오기 실패:`, error);
        
        // 에러가 있어도 기본 정보는 포함
        const movieWithOTT = {
          id: movie.id,
          title: movie.title,
          media_type: 'movie',
          overview: movie.overview || `${movie.title} (${movie.year})`,
          release_date: `${movie.year}-01-01`,
          vote_average: movie.rating || 0,
          popularity: movie.rating || 0,
          poster_path: movie.posterUrl,
          ott_providers: { KR: { flatrate: [], buy: [], rent: [] } },
          local_data: true
        };
        
        moviesWithOTT.push(movieWithOTT);
      }
    }
    
    console.log('OTT 정보 추가 완료:', moviesWithOTT.length);
    
    // OTT 정보가 있는 콘텐츠만 필터링 (일시적으로 비활성화)
    // const filteredMovies = filterByOTT(moviesWithOTT);
    const filteredMovies = moviesWithOTT; // 필터링 비활성화
    console.log('OTT 필터링 후 영화 수:', filteredMovies.length);
    
    const response = {
      results: filteredMovies.slice(0, 50), // 50개로 조정
      total_pages: 1,
      total_results: filteredMovies.length,
      page: 1,
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };
    
    console.log('인기 영화 API 응답 완료:', {
      totalMovies: response.results.length,
      totalResults: response.total_results
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Popular movies API error:', error);
    
    let errorMessage = '인기 영화를 불러오는 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API 키가 설정되지 않았습니다')) {
        errorMessage = 'API 키 설정 오류입니다.';
        statusCode = 500;
      } else if (error.message.includes('API Error: 401')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
        statusCode = 401;
      } else if (error.message.includes('API Error: 429')) {
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