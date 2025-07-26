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
    const movieId = parseInt(id);
    
    // URL에서 제목 파라미터 추출
    const url = new URL(request.url);
    const titleParam = url.searchParams.get('title');
    
    console.log('=== Movie API 호출 시작 ===');
    console.log('요청 URL:', request.url);
    console.log('파라미터:', { id, movieId, titleParam });
    console.log('요청 헤더:', Object.fromEntries(request.headers.entries()));
    
    if (isNaN(movieId)) {
      console.error('잘못된 영화 ID:', id);
      return NextResponse.json(
        { error: '잘못된 영화 ID입니다.' },
        { status: 400 }
      );
    }

    // 영화 상세 정보만 먼저 가져오기 (OTT 정보는 선택적)
    let movieDetails;
    let ottProviders = null;
    
    try {
      console.log('TMDB API 호출 시작 - 영화 ID:', movieId);
      console.log('TMDB API URL 예상:', `https://api.themoviedb.org/3/movie/${movieId}?api_key=...&language=ko-KR`);
      
      movieDetails = await tmdbClient.getMovieDetails(movieId);
      
      console.log('TMDB API 호출 완료');
      console.log('영화 상세 정보 성공:', {
        id: (movieDetails as Record<string, unknown>)?.id,
        title: (movieDetails as Record<string, unknown>)?.title,
        name: (movieDetails as Record<string, unknown>)?.name,
        hasData: !!movieDetails,
        dataType: typeof movieDetails,
        isObject: movieDetails && typeof movieDetails === 'object'
      });
      
      // 데이터 유효성 검사 추가
      const movieDetailsTyped = movieDetails as { title?: string; name?: string };
      if (!movieDetails || (!movieDetailsTyped.title && !movieDetailsTyped.name)) {
        console.error('영화 상세 정보가 유효하지 않음:', movieDetails);
        
        // 제목으로 검색하는 대체 방법 시도
        console.log('제목으로 검색하는 대체 방법 시도...');
        try {
          let searchQuery = movieId.toString();
          
          // 제목 파라미터가 있으면 제목으로 검색
          if (titleParam) {
            searchQuery = titleParam;
            console.log('제목으로 검색:', searchQuery);
          }
          
          const searchResults = await tmdbClient.searchMovies(searchQuery);
          console.log('검색 결과 개수:', Array.isArray(searchResults) ? searchResults.length : 0);
          console.log('검색 결과:', searchResults);
          
          if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
            const firstResult = searchResults[0] as Record<string, unknown>;
            console.log('검색으로 찾은 영화:', firstResult);
            
            // 검색 결과로 상세 정보 다시 가져오기
            const detailedResult = await tmdbClient.getMovieDetails(firstResult.id as number);
            if (detailedResult) {
              movieDetails = detailedResult;
              console.log('검색을 통한 상세 정보 성공:', movieDetails);
            }
          } else {
            console.log('검색 결과가 없음');
          }
        } catch (searchError) {
          console.error('검색 대체 방법도 실패:', searchError);
        }
        
        if (!movieDetails || (!movieDetailsTyped.title && !movieDetailsTyped.name)) {
          console.error('최종적으로 영화 정보를 찾을 수 없음');
          return NextResponse.json(
            { error: '영화 정보를 찾을 수 없습니다.' },
            { status: 404 }
          );
        }
      }
      
      // 추가 디버깅 정보
      console.log('영화 데이터 구조:', {
        hasTitle: !!movieDetailsTyped.title,
        hasName: !!movieDetailsTyped.name,
        title: movieDetailsTyped.title,
        name: movieDetailsTyped.name,
        keys: Object.keys(movieDetails || {}),
        fullData: movieDetails
      });
      
    } catch (error) {
      console.error('영화 상세 정보 가져오기 실패:', error);
      
      // TMDB API 에러 타입별 처리
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          console.log('404 에러 - 검색을 통한 대체 방법 시도...');
          try {
            const searchResults = await tmdbClient.searchMovies(movieId.toString());
            console.log('404 에러 후 검색 결과:', searchResults);
            if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
              const firstResult = searchResults[0] as Record<string, unknown>;
              const detailedResult = await tmdbClient.getMovieDetails(firstResult.id as number);
              if (detailedResult) {
                movieDetails = detailedResult;
                console.log('404 에러 후 검색을 통한 상세 정보 성공:', movieDetails);
              }
            }
          } catch (searchError) {
            console.error('404 에러 후 검색 대체 방법도 실패:', searchError);
          }
          
          if (!movieDetails) {
            return NextResponse.json(
              { error: '영화를 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
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
      
      if (!movieDetails) {
        return NextResponse.json(
          { error: '영화 정보를 불러오는 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
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
    
    // 한국어 콘텐츠인 경우 한국 OTT 정보 추가
    const movieTitle = (movieDetails as { title?: string }).title || '';
    if (/[가-힣]/.test(movieTitle) && combinedOTTInfo.length === 0) {
      const koreanProviders = findKoreanOTTProviders(movieTitle);
      if (koreanProviders.length > 0) {
        // 한국 OTT 정보를 별도 필드로 추가
        const movieWithKoreanOTT = {
          ...(movieDetails as Record<string, unknown>),
          ott_providers: combinedOTTInfo,
          korean_ott_providers: koreanProviders
        };
        console.log('한국 OTT 정보 추가:', koreanProviders);
        return NextResponse.json(movieWithKoreanOTT);
      }
    }
    
    // 한국어 콘텐츠인 경우 기본 OTT 정보 추가
    if (/[가-힣]/.test(movieTitle)) {
      const koreanProviders = findKoreanOTTProviders(movieTitle);
      if (koreanProviders.length > 0) {
        const movieWithKoreanOTT = {
          ...(movieDetails as Record<string, unknown>),
          ott_providers: combinedOTTInfo,
          korean_ott_providers: koreanProviders
        };
        console.log('한국 OTT 정보 추가 (기본):', koreanProviders);
        return NextResponse.json(movieWithKoreanOTT);
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