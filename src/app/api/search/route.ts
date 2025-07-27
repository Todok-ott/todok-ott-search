import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { enhanceWithKoreanOTTInfo } from '@/lib/koreanOTTs';
import { debugOTTInfo } from '@/lib/ottUtils';
import moviesData from '@/data/movies.json';

// 검색 결과 타입 정의
type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  media_type?: 'movie' | 'tv';
  original_title?: string;
  display_title?: string;
  overview?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  popularity?: number;
  vote_count?: number;
  origin_country?: string[];
  original_language?: string;
  backdrop_path?: string;
  ott_providers?: unknown;
  local_data?: boolean;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        results: [], 
        total_pages: 0, 
        total_results: 0 
      });
    }

    console.log('=== 검색 API 시작 ===');
    console.log('검색 요청:', query.trim());

    // 1단계: 로컬 데이터에서 검색
    const localResults = searchLocalData(query.trim());
    console.log('로컬 검색 결과:', localResults.length);
    console.log('로컬 결과:', localResults);

    // 2단계: TMDB API로 검색
    let tmdbResults: unknown[] = [];
    try {
      const searchQuery = query.trim();
      const isKorean = /[가-힣]/.test(searchQuery);
      
      if (isKorean) {
        // 한국어 검색어인 경우 영어 제목으로 변환하여 검색
        const englishTitles = getEnglishTitlesForKorean(searchQuery);
        console.log('한국어 검색어에 대한 영어 제목들:', englishTitles);
        
        // 각 영어 제목으로 검색
        for (const englishTitle of englishTitles) {
          try {
            console.log(`TMDB 검색 시도: "${englishTitle}"`);
            const result = await tmdbClient.searchMulti(englishTitle, parseInt(page));
            console.log(`"${englishTitle}" 검색 결과:`, result.results?.length || 0);
            if (result.results && result.results.length > 0) {
              tmdbResults.push(...result.results);
            }
          } catch (error) {
            console.error(`영어 제목 "${englishTitle}" 검색 실패:`, error);
          }
        }
        
        // 중복 제거
        tmdbResults = removeDuplicates(tmdbResults);
        console.log('TMDB 중복 제거 후 결과:', tmdbResults.length);
      } else {
        // 영어 검색은 기존 방식 사용
        console.log(`영어 검색: "${searchQuery}"`);
        const searchResult = await tmdbClient.searchMulti(searchQuery, parseInt(page));
        tmdbResults = searchResult.results || [];
        console.log('영어 검색 결과:', tmdbResults.length);
      }
    } catch (error) {
      console.error('TMDB 검색 실패:', error);
      // TMDB 실패 시 로컬 결과만 반환
      return NextResponse.json({
        results: localResults,
        total_pages: 1,
        total_results: localResults.length,
        source: 'local_only'
      });
    }

    // 3단계: 로컬 결과와 TMDB 결과 결합
    const combinedResults = localResults.concat(tmdbResults as SearchResult[]);
    console.log('결합된 검색 결과:', combinedResults.length);
    console.log('결합된 결과:', combinedResults);

    // 4단계: 각 결과에 OTT 정보 추가 (최대 5개까지만 처리하여 성능 최적화)
    let resultsWithOTT: unknown[] = await Promise.all(
      combinedResults.slice(0, 5).map(async (item: unknown) => {
        const itemTyped = item as SearchResult;
        try {
          let ottInfo = null;
          
          // 로컬 데이터인 경우 ottPlatforms를 ott_providers 구조로 변환
          if (itemTyped.local_data && Array.isArray(itemTyped.ottPlatforms)) {
            console.log('로컬 데이터 OTT 변환:', itemTyped.title, itemTyped.ottPlatforms);
            ottInfo = {
              KR: {
                flatrate: itemTyped.ottPlatforms.map((platform: string) => ({
                  provider_id: Math.random(), // 임시 ID
                  provider_name: platform,
                  logo_path: `/ott-logos/${platform.toLowerCase().replace(/\s+/g, '-')}.svg`
                }))
              }
            };
          } else if (itemTyped.media_type === 'movie') {
            console.log(`영화 OTT 정보 가져오기: ${itemTyped.title} (ID: ${itemTyped.id})`);
            const providers = await tmdbClient.getMovieWatchProviders(itemTyped.id);
            const providerData = providers as { results?: { KR?: unknown } };
            ottInfo = providerData.results?.KR || null;
            console.log(`영화 OTT 결과:`, ottInfo);
          } else if (itemTyped.media_type === 'tv') {
            console.log(`TV OTT 정보 가져오기: ${itemTyped.title} (ID: ${itemTyped.id})`);
            const providers = await tmdbClient.getTVWatchProviders(itemTyped.id);
            const providerData = providers as { results?: { KR?: unknown } };
            ottInfo = providerData.results?.KR || null;
            console.log(`TV OTT 결과:`, ottInfo);
          }
          
          const resultWithOTT = {
            ...itemTyped,
            ott_providers: ottInfo
          };
          
          // 디버깅 정보 출력
          debugOTTInfo(resultWithOTT);
          
          return resultWithOTT;
        } catch (error) {
          console.error('OTT 정보 가져오기 실패:', error);
          return itemTyped;
        }
      })
    );

    // 5단계: 한국어 콘텐츠에 한국 OTT 정보 추가 (로컬 데이터가 아닌 경우만)
    resultsWithOTT = await Promise.all(
      resultsWithOTT.map(async (item: unknown) => {
        const itemTyped = item as SearchResult;
        const title = itemTyped.title || itemTyped.name || '';
        
        // 로컬 데이터가 아닌 경우에만 한국 OTT 정보 추가
        if (/[가-힣]/.test(title) && !itemTyped.local_data) {
          try {
            const koreanOTTInfo = await enhanceWithKoreanOTTInfo([itemTyped]);
            return koreanOTTInfo[0] || itemTyped;
          } catch (error) {
            console.error('한국 OTT 정보 추가 실패:', error);
            return itemTyped;
          }
        }
        return itemTyped;
      })
    );

    console.log('최종 결과:', resultsWithOTT);
    console.log('=== 검색 API 완료 ===');

    return NextResponse.json({
      results: resultsWithOTT,
      total_pages: Math.ceil(combinedResults.length / 20),
      total_results: combinedResults.length,
      source: 'combined'
    });

  } catch (error) {
    console.error('검색 API 에러:', error);
    return NextResponse.json(
      { 
        error: '검색 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
        results: [],
        total_pages: 0,
        total_results: 0
      },
      { status: 500 }
    );
  }
}

// 로컬 데이터 검색 함수
function searchLocalData(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  
  console.log('로컬 검색 시작:', query);
  console.log('영화 데이터 개수:', moviesData.movies.length);
  console.log('드라마 데이터 개수:', moviesData.dramas.length);
  
  // 영화 검색
  for (const movie of moviesData.movies) {
    const title = movie.title.toLowerCase();
    const originalTitle = movie.originalTitle.toLowerCase();
    const displayTitle = movie.displayTitle.toLowerCase();
    const searchKeywords = movie.searchKeywords.map(k => k.toLowerCase());
    
    if (title.includes(queryLower) || 
        originalTitle.includes(queryLower) || 
        displayTitle.includes(queryLower) ||
        searchKeywords.some(keyword => keyword.includes(queryLower))) {
      
      console.log('영화 매칭됨:', movie.title);
      results.push({
        id: movie.tmdbId || movie.id,
        title: movie.title,
        name: movie.title, // TV 쇼용
        original_title: movie.originalTitle,
        display_title: movie.displayTitle,
        media_type: movie.type === 'tv' ? 'tv' : 'movie',
        overview: movie.overview,
        poster_path: movie.posterUrl.startsWith('http') ? movie.posterUrl : `https://image.tmdb.org/t/p/w500${movie.posterUrl}`,
        vote_average: movie.rating,
        release_date: movie.year ? `${movie.year}-01-01` : undefined,
        first_air_date: movie.type === 'tv' ? `${movie.year}-01-01` : undefined,
        genre_ids: movie.genre.map((_, index) => index + 1),
        popularity: movie.rating * 100,
        vote_count: Math.floor(movie.rating * 100),
        origin_country: ['KR'],
        original_language: 'ko',
        backdrop_path: movie.posterUrl.startsWith('http') ? movie.posterUrl : `https://image.tmdb.org/t/p/w500${movie.posterUrl}`,
        ott_providers: movie.ottPlatforms,
        local_data: true
      });
    }
  }
  
  // 드라마 검색
  for (const drama of moviesData.dramas) {
    const title = drama.title.toLowerCase();
    const originalTitle = drama.originalTitle.toLowerCase();
    const displayTitle = drama.displayTitle.toLowerCase();
    const searchKeywords = drama.searchKeywords.map(k => k.toLowerCase());
    
    if (title.includes(queryLower) || 
        originalTitle.includes(queryLower) || 
        displayTitle.includes(queryLower) ||
        searchKeywords.some(keyword => keyword.includes(queryLower))) {
      
      console.log('드라마 매칭됨:', drama.title);
      results.push({
        id: drama.tmdbId || drama.id,
        title: drama.title,
        name: drama.title, // TV 쇼용
        original_title: drama.originalTitle,
        display_title: drama.displayTitle,
        media_type: 'tv',
        overview: drama.overview,
        poster_path: drama.posterUrl.startsWith('http') ? drama.posterUrl : `https://image.tmdb.org/t/p/w500${drama.posterUrl}`,
        vote_average: drama.rating,
        first_air_date: drama.year ? `${drama.year}-01-01` : undefined,
        genre_ids: drama.genre.map((_, index) => index + 1),
        popularity: drama.rating * 100,
        vote_count: Math.floor(drama.rating * 100),
        origin_country: ['KR'],
        original_language: 'ko',
        backdrop_path: drama.posterUrl.startsWith('http') ? drama.posterUrl : `https://image.tmdb.org/t/p/w500${drama.posterUrl}`,
        ott_providers: drama.ottPlatforms,
        local_data: true
      });
    }
  }
  
  console.log('로컬 검색 완료, 결과 개수:', results.length);
  return results;
}

// 한국어 검색어에 대한 영어 제목 매핑
function getEnglishTitlesForKorean(koreanQuery: string): string[] {
  const englishTitles: string[] = [];
  
  console.log('한국어 검색어:', koreanQuery);
  
  // 로컬 데이터에서 매칭되는 영어 제목 찾기
  for (const movie of moviesData.movies) {
    if (movie.originalTitle.toLowerCase().includes(koreanQuery.toLowerCase()) ||
        movie.displayTitle.toLowerCase().includes(koreanQuery.toLowerCase())) {
      englishTitles.push(movie.title);
      console.log('영화 영어 제목 매칭:', movie.originalTitle, '→', movie.title);
    }
  }
  
  for (const drama of moviesData.dramas) {
    if (drama.originalTitle.toLowerCase().includes(koreanQuery.toLowerCase()) ||
        drama.displayTitle.toLowerCase().includes(koreanQuery.toLowerCase())) {
      englishTitles.push(drama.title);
      console.log('드라마 영어 제목 매칭:', drama.originalTitle, '→', drama.title);
    }
  }
  
  // 기본 영어 제목들 추가
  englishTitles.push(koreanQuery); // 원본도 시도
  
  console.log('최종 영어 제목들:', englishTitles);
  return [...new Set(englishTitles)];
}

// 중복 제거 함수
function removeDuplicates(results: unknown[]): unknown[] {
  const seen = new Set<string>();
  return results.filter(item => {
    const itemTyped = item as SearchResult;
    const key = `${itemTyped.id}-${itemTyped.media_type}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
} 