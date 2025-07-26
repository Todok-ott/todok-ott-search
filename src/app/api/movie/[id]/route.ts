import { NextResponse } from 'next/server';
import { tmdbClient, Movie } from '@/lib/tmdb';
import { combineOTTData, OTTProvider } from '@/lib/ottUtils';
import { findKoreanOTTProviders } from '@/lib/koreanOTTs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Movie API 호출 시작 ===');
  console.log('요청 URL:', request.url);
  console.log('요청 메서드:', request.method);
  
  try {
    const { id } = await params;
    console.log('받은 ID:', id);
    
    // URL에서 제목 파라미터 추출
    const url = new URL(request.url);
    const titleParam = url.searchParams.get('title');
    console.log('제목 파라미터:', titleParam);
    
    let movieDetails;
    let ottProviders = null;
    let actualMovieId: number | null = null;
    
    // 항상 검색 기반으로 처리
    console.log('검색 기반 처리 시작');
    
    let searchQuery = id; // 기본적으로 ID를 검색어로 사용
    
    // 제목 파라미터가 있으면 제목으로 검색
    if (titleParam) {
      searchQuery = titleParam;
      console.log('제목 파라미터로 검색:', searchQuery);
    }
    
    // 검색어 정리 (특수문자 제거, 공백 정리)
    searchQuery = searchQuery.replace(/[^\w\s가-힣]/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('정리된 검색어:', searchQuery);
    
    try {
      // 여러 검색 시도
      let searchResults = null;
      let selectedResult: Movie | null = null;
      
      // 1. 원본 검색어로 먼저 시도
      console.log('1차 검색 시도:', searchQuery);
      searchResults = await tmdbClient.searchMulti(searchQuery);
      
      if (searchResults && searchResults.results && searchResults.results.length > 0) {
        console.log('1차 검색 결과 개수:', searchResults.results.length);
        console.log('1차 검색 결과:', searchResults.results.slice(0, 5).map(r => ({
          title: r.title || r.name,
          id: r.id,
          media_type: r.media_type
        })));
        
        // 정확한 매칭 찾기
        selectedResult = findBestMatch(searchResults.results, searchQuery);
      }
      
      // 2. 첫 번째 결과가 만족스럽지 않으면 더 넓은 검색
      if (!selectedResult || !isGoodMatch(selectedResult, searchQuery)) {
        console.log('2차 검색 시도 - 더 넓은 검색');
        
        // 한국어 제목에서 주요 키워드 추출
        const keywords = extractKeywords(searchQuery);
        console.log('추출된 키워드:', keywords);
        
        for (const keyword of keywords) {
          if (keyword.length > 1) { // 1글자 키워드는 제외
            console.log('키워드로 검색:', keyword);
            const keywordResults = await tmdbClient.searchMulti(keyword);
            
            if (keywordResults && keywordResults.results && keywordResults.results.length > 0) {
              const keywordMatch = findBestMatch(keywordResults.results, searchQuery);
              if (keywordMatch && isGoodMatch(keywordMatch, searchQuery)) {
                selectedResult = keywordMatch;
                console.log('키워드 검색으로 매칭 발견:', keywordMatch.title || keywordMatch.name);
                break;
              }
            }
          }
        }
      }
      
      // 3. 여전히 결과가 없으면 첫 번째 결과 사용
      if (!selectedResult && searchResults && searchResults.results && searchResults.results.length > 0) {
        selectedResult = searchResults.results[0];
        console.log('첫 번째 결과 사용:', selectedResult.title || selectedResult.name);
      }
      
      if (selectedResult) {
        console.log('최종 선택된 결과:', {
          title: selectedResult.title || selectedResult.name,
          id: selectedResult.id,
          media_type: selectedResult.media_type
        });
        
        // 선택된 결과의 ID로 상세 정보 가져오기
        let detailedResult;
        console.log('상세 정보 가져오기 시작...');
        if (selectedResult.media_type === 'tv') {
          detailedResult = await tmdbClient.getTVDetails(selectedResult.id);
        } else {
          detailedResult = await tmdbClient.getMovieDetails(selectedResult.id);
        }
        
        if (detailedResult) {
          movieDetails = detailedResult;
          actualMovieId = selectedResult.id;
          console.log('검색을 통한 상세 정보 성공:', movieDetails);
        }
      } else {
        console.log('검색 결과가 없음');
      }
    } catch (searchError) {
      console.error('검색 실패:', searchError);
      return NextResponse.json(
        { error: `검색 중 오류가 발생했습니다: ${searchError instanceof Error ? searchError.message : 'Unknown error'}` },
        { status: 500 }
      );
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
    const movieDetailsTyped = movieDetails as { title?: string; name?: string; first_air_date?: string; release_date?: string };
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

    // TV 쇼인 경우 TV API로 리다이렉트하도록 신호 전송
    if (movieDetailsTyped.first_air_date && !movieDetailsTyped.release_date) {
      console.log('TV 쇼 감지, TV API로 리다이렉트 신호 전송');
      return NextResponse.json({
        ...movieDetails,
        is_tv_show: true,
        redirect_to_tv: true,
        tv_id: actualMovieId
      });
    }

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

// 최적의 매칭을 찾는 함수
function findBestMatch(results: Movie[], searchQuery: string): Movie {
  const searchQueryLower = searchQuery.toLowerCase();
  
  // 1. 정확한 매칭
  for (const result of results) {
    const resultTitle = (result.title || result.name || '').toLowerCase();
    if (resultTitle === searchQueryLower) {
      console.log('정확한 매칭 발견:', result.title || result.name);
      return result;
    }
  }
  
  // 2. 포함 관계 매칭 (더 엄격한 조건)
  for (const result of results) {
    const resultTitle = (result.title || result.name || '').toLowerCase();
    if (resultTitle.includes(searchQueryLower) || searchQueryLower.includes(resultTitle)) {
      const similarity = Math.min(resultTitle.length, searchQueryLower.length) / Math.max(resultTitle.length, searchQueryLower.length);
      if (similarity > 0.6) { // 60% 이상 유사도
        console.log('유사 매칭 발견:', result.title || result.name, '유사도:', similarity);
        return result;
      }
    }
  }
  
  // 3. 첫 번째 결과 반환
  console.log('첫 번째 결과 사용:', results[0].title || results[0].name);
  return results[0];
}

// 좋은 매칭인지 확인하는 함수
function isGoodMatch(result: Movie, searchQuery: string): boolean {
  const resultTitle = (result.title || result.name || '').toLowerCase();
  const searchQueryLower = searchQuery.toLowerCase();
  
  // 정확한 매칭
  if (resultTitle === searchQueryLower) return true;
  
  // 높은 유사도 매칭
  if (resultTitle.includes(searchQueryLower) || searchQueryLower.includes(resultTitle)) {
    const similarity = Math.min(resultTitle.length, searchQueryLower.length) / Math.max(resultTitle.length, searchQueryLower.length);
    return similarity > 0.6;
  }
  
  return false;
}

// 한국어 제목에서 키워드 추출
function extractKeywords(title: string): string[] {
  // 특수문자 제거
  const cleanTitle = title.replace(/[^\w\s가-힣]/g, ' ').trim();
  
  // 공백으로 분리
  const words = cleanTitle.split(/\s+/);
  
  // 2글자 이상의 단어만 필터링
  const keywords = words.filter(word => word.length >= 2);
  
  // 중복 제거
  return [...new Set(keywords)];
} 