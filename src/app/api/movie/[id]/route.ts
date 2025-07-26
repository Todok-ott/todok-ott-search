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
    
    // URL에서 제목 파라미터 추출
    const url = new URL(request.url);
    const titleParam = url.searchParams.get('title');
    
    console.log('=== Movie API 호출 시작 ===');
    console.log('요청 URL:', request.url);
    console.log('파라미터:', { id, titleParam });
    console.log('요청 헤더:', Object.fromEntries(request.headers.entries()));
    
    let movieDetails;
    let ottProviders = null;
    let actualMovieId: number | null = null;
    
    // ID가 숫자인지 확인
    const movieId = parseInt(id);
    const isNumericId = !isNaN(movieId);
    
    if (isNumericId) {
      // 숫자 ID인 경우 - 직접 영화 정보 가져오기
      console.log('숫자 ID로 영화 정보 가져오기:', movieId);
      
      try {
        movieDetails = await tmdbClient.getMovieDetails(movieId);
        actualMovieId = movieId;
        console.log('숫자 ID로 영화 정보 성공:', movieDetails);
      } catch (error) {
        console.error('숫자 ID로 영화 정보 가져오기 실패:', error);
        movieDetails = null;
      }
    }
    
    // 숫자 ID로 실패했거나 숫자가 아닌 ID인 경우 - 제목으로 검색
    if (!movieDetails) {
      console.log('제목으로 검색 시작');
      
      let searchQuery = id; // 기본적으로 ID를 검색어로 사용
      
      // 제목 파라미터가 있으면 제목으로 검색
      if (titleParam) {
        searchQuery = titleParam;
        console.log('제목 파라미터로 검색:', searchQuery);
      }
      
      try {
        const searchResults = await tmdbClient.searchMovies(searchQuery);
        console.log('검색 결과 개수:', Array.isArray(searchResults) ? searchResults.length : 0);
        
        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
          // 정확한 제목 매칭 시도
          let bestMatch = searchResults[0] as Record<string, unknown>;
          let exactMatch = null;
          
          // 정확한 제목 매칭 찾기
          for (const result of searchResults) {
            const resultTitle = (result as Record<string, unknown>).title as string;
            const resultName = (result as Record<string, unknown>).name as string;
            const currentTitle = resultTitle || resultName || '';
            
            // 대소문자 구분 없이 정확한 매칭
            if (currentTitle.toLowerCase() === searchQuery.toLowerCase()) {
              exactMatch = result;
              break;
            }
            
            // 부분 매칭 (포함 관계)
            if (currentTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                searchQuery.toLowerCase().includes(currentTitle.toLowerCase())) {
              bestMatch = result;
            }
          }
          
          const selectedResult = exactMatch || bestMatch;
          console.log('검색으로 찾은 영화:', selectedResult);
          
          // 검색 결과의 ID로 상세 정보 가져오기
          const detailedResult = await tmdbClient.getMovieDetails(selectedResult.id as number);
          if (detailedResult) {
            movieDetails = detailedResult;
            actualMovieId = selectedResult.id as number;
            console.log('검색을 통한 상세 정보 성공:', movieDetails);
          }
        } else {
          console.log('검색 결과가 없음');
        }
      } catch (searchError) {
        console.error('검색 실패:', searchError);
      }
    }
    
    // 최종적으로 영화 정보를 찾지 못한 경우
    if (!movieDetails) {
      console.error('영화 정보를 찾을 수 없음');
      return NextResponse.json(
        { error: '영화 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 데이터 유효성 검사
    const movieDetailsTyped = movieDetails as { title?: string; name?: string };
    if (!movieDetailsTyped.title && !movieDetailsTyped.name) {
      console.error('영화 상세 정보가 유효하지 않음:', movieDetails);
      return NextResponse.json(
        { error: '영화 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 추가 디버깅 정보
    console.log('영화 데이터 구조:', {
      hasTitle: !!movieDetailsTyped.title,
      hasName: !!movieDetailsTyped.name,
      title: movieDetailsTyped.title,
      name: movieDetailsTyped.name,
      actualMovieId,
      keys: Object.keys(movieDetails || {}),
      fullData: movieDetails
    });

    // OTT 정보는 선택적으로 가져오기 (실제 영화 ID가 있는 경우만)
    if (actualMovieId) {
      try {
        ottProviders = await tmdbClient.getMovieWatchProviders(actualMovieId);
        console.log('OTT 정보 성공:', ottProviders);
      } catch (error) {
        console.error('OTT 정보 가져오기 실패:', error);
        // OTT 정보 실패는 치명적이지 않음
      }
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
    const releaseDate = (movieDetails as { release_date?: string }).release_date;
    
    // 개봉일 확인 - 아직 개봉하지 않은 영화는 OTT 정보 추가하지 않음
    const isReleased = releaseDate && new Date(releaseDate) <= new Date();
    
    console.log('OTT 정보 필터링:', {
      title: movieTitle,
      releaseDate,
      isReleased,
      hasKoreanTitle: /[가-힣]/.test(movieTitle),
      hasOTTInfo: combinedOTTInfo.length > 0
    });
    
    if (/[가-힣]/.test(movieTitle) && combinedOTTInfo.length === 0 && isReleased) {
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
    
    // 한국어 콘텐츠인 경우 기본 OTT 정보 추가 (개봉된 영화만)
    if (/[가-힣]/.test(movieTitle) && isReleased) {
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