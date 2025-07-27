'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Play, Info, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import AdBanner from '@/components/AdBanner';
import Footer from '@/components/Footer';
// Movie 인터페이스 정의
interface Movie {
  id: string | number;
  title: string;
  name?: string;
  media_type: 'movie' | 'tv';
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
  ott_providers?: {
    KR?: {
      flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      buy?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      rent?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
    };
  } | null;
  local_data?: boolean;
  year?: number;
  [key: string]: unknown;
}
import Image from 'next/image';

// Movie 타입을 확장하여 korean_ott_providers 속성 추가
interface MovieWithKoreanOTT extends Movie {
  korean_ott_providers?: unknown[];
  original_title?: string;
  display_title?: string;
  local_data?: boolean;
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<MovieWithKoreanOTT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year' | 'title'>('relevance');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async () => {
    if (!query) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      let filteredResults = data.results || [];
      
      // OTT 정보가 없는 콘텐츠는 제외
      filteredResults = filteredResults.filter((item: MovieWithKoreanOTT) => {
        // TMDB ott_providers: flatrate만 체크 (undefined, null, 빈 배열, 빈 객체 모두 제외)
        const hasTMDB = !!(
          item.ott_providers &&
          Array.isArray(item.ott_providers.flatrate) &&
          item.ott_providers.flatrate.length > 0
        );
        // Korean ott_providers: MovieWithKoreanOTT 타입으로 안전하게 체크
        const hasKorean = !!(
          item.korean_ott_providers &&
          Array.isArray(item.korean_ott_providers) &&
          item.korean_ott_providers.length > 0
        );
        return hasTMDB || hasKorean;
      });
      
      console.log('필터링 후 결과 수:', filteredResults.length);
      
      // 타입 필터링
      if (filterType !== 'all') {
        filteredResults = filteredResults.filter((item: MovieWithKoreanOTT) => 
          item.media_type === filterType
        );
      }
      
      // 정렬
      filteredResults.sort((a: MovieWithKoreanOTT, b: MovieWithKoreanOTT) => {
        switch (sortBy) {
          case 'rating':
            return b.vote_average - a.vote_average;
          case 'year':
            const yearA = a.release_date?.split('-')[0] || a.first_air_date?.split('-')[0] || '0';
            const yearB = b.release_date?.split('-')[0] || b.first_air_date?.split('-')[0] || '0';
            return parseInt(yearB) - parseInt(yearA);
          case 'title':
            return (a.title || a.name || '').localeCompare(b.title || b.name || '');
          default:
            return 0;
        }
      });
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, sortBy, filterType]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleResultSelect = (movie: MovieWithKoreanOTT) => {
    const movieId = movie.id;
    const movieTitle = movie.title || movie.name || '';
    
    // 로컬 데이터인 경우 display_title 사용
    const displayTitle = movie.local_data ? (movie.display_title || movie.original_title || movieTitle) : movieTitle;
    
    // TV 쇼인지 확인
    const isTV = movie.media_type === 'tv' || movie.first_air_date;
    
    if (isTV) {
      // TV 쇼인 경우 TV 페이지로 이동
      window.location.href = `/tv/${movieId}?title=${encodeURIComponent(displayTitle)}`;
    } else {
      // 영화인 경우 영화 페이지로 이동
      window.location.href = `/movie/${movieId}?title=${encodeURIComponent(displayTitle)}`;
    }
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(newQuery.trim())}`;
    }
  };

  // 제목 표시 함수
  const getDisplayTitle = (item: MovieWithKoreanOTT) => {
    // 로컬 데이터인 경우 display_title 우선 사용
    if (item.local_data && item.display_title) {
      return item.display_title;
    }
    
    // 한국어 제목이 있으면 한국어 제목 표시
    if (item.original_title && /[가-힣]/.test(item.original_title)) {
      return item.original_title;
    }
    
    // 기본 제목 사용
    return item.title || item.name || '';
  };

  // 부제목 표시 함수
  const getSubtitle = (item: MovieWithKoreanOTT) => {
    // 로컬 데이터인 경우 영어 제목을 부제목으로 표시
    if (item.local_data && item.title && item.title !== item.display_title) {
      return item.title;
    }
    
    // 한국어 제목이 있고 영어 제목과 다른 경우 영어 제목을 부제목으로 표시
    if (item.original_title && item.title && 
        item.original_title !== item.title && 
        /[가-힣]/.test(item.original_title)) {
      return item.title;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* 헤더 */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <SearchBar onSearch={handleSearch} initialQuery={query} />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/30 backdrop-blur-sm border-b border-white/10 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-wrap gap-4">
                {/* 정렬 옵션 */}
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">정렬:</span>
                  {[
                    { value: 'relevance', label: '관련도' },
                    { value: 'rating', label: '평점' },
                    { value: 'year', label: '연도' },
                    { value: 'title', label: '제목' }
                  ].map((sort) => (
                    <button
                      key={sort.value}
                      onClick={() => setSortBy(sort.value as 'relevance' | 'rating' | 'year' | 'title')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        sortBy === sort.value
                          ? 'bg-[#FFD700] text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>

                {/* 타입 필터 */}
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">타입:</span>
                  {[
                    { value: 'all', label: '전체' },
                    { value: 'movie', label: '영화' },
                    { value: 'tv', label: '드라마' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFilterType(type.value as 'all' | 'movie' | 'tv')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filterType === type.value
                          ? 'bg-[#FFD700] text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* 검색 결과 헤더 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            &quot;{query}&quot; 검색 결과
          </h2>
          <p className="text-gray-400">
            {isLoading ? '검색 중...' : `${results.length}개의 결과를 찾았습니다.`}
          </p>
        </motion.div>

        {/* 광고 배너 - 검색 결과 헤더 아래 */}
        {!isLoading && results.length > 0 && (
          <AdBanner />
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="cinematic-spinner w-12 h-12"></div>
          </motion.div>
        )}

        {/* 검색 결과 */}
        {!isLoading && (
          <AnimatePresence>
            {results.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {results.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                    className="group cursor-pointer"
                    onClick={() => handleResultSelect(item)}
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-2xl poster-card">
                      <Image
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder-poster.jpg'}
                        alt={getDisplayTitle(item)}
                        width={500}
                        height={750}
                        className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="text-white font-semibold text-lg mb-1 truncate">
                            {getDisplayTitle(item)}
                          </h4>
                          {getSubtitle(item) && (
                            <p className="text-gray-300 text-sm mb-2 truncate">
                              {getSubtitle(item)}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span>{item.vote_average && typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                  {item.media_type === 'tv' ? 'TV' : '영화'}
                                </span>
                              </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 플레이 버튼 */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-gray-400 text-lg mb-4">
                  검색 결과가 없습니다.
                </div>
                <p className="text-gray-500">
                  다른 키워드로 검색해보세요.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 