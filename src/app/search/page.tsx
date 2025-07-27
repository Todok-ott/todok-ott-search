'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { hasAnyOTT } from '@/lib/ottUtils';

interface MovieWithKoreanOTT extends Movie {
  korean_ott_providers?: unknown[];
  original_title?: string;
  display_title?: string;
  local_data?: boolean;
}

interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
  ott_providers?: {
    flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
  };
}

export default function SearchResults() {
  const [results, setResults] = useState<MovieWithKoreanOTT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [query, setQuery] = useState<string>('');

  function SearchResultsContent() {
    const performSearch = useCallback(async () => {
      if (!query) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        let filteredResults = data.results || [];
        
        // OTT 정보가 있는 콘텐츠만 필터링 (재사용 함수 사용)
        filteredResults = filteredResults.filter((item: MovieWithKoreanOTT) => hasAnyOTT(item));
        
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
      // URL 파라미터에서 쿼리 가져오기
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlQuery = urlParams.get('q');
        if (urlQuery) {
          setQuery(urlQuery);
        }
      }
    }, []);

    useEffect(() => {
      performSearch();
    }, [performSearch]);

    const handleResultSelect = (movie: MovieWithKoreanOTT) => {
      const movieId = movie.id;
      const movieTitle = movie.title || movie.name || '';
      
      // 로컬 데이터인 경우 display_title 사용
      const displayTitle = movie.local_data ? (movie.display_title || movie.original_title || movieTitle) : movieTitle;
      
      // media_type에 따른 올바른 링크 생성
      const mediaType = movie.media_type || 'movie';
      const baseUrl = mediaType === 'tv' ? '/tv' : '/movie';
      const queryParams = new URLSearchParams({
        title: displayTitle,
        type: mediaType
      });
      
      const finalUrl = `${baseUrl}/${movieId}?${queryParams.toString()}`;
      console.log('이동할 URL:', finalUrl);
      
      window.location.href = finalUrl;
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
      const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
      const type = item.media_type === 'tv' ? '드라마' : '영화';
      return year ? `${year} • ${type}` : type;
    };

    if (!query) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">검색어를 입력해주세요</h1>
            <p className="text-gray-400 mb-6">영화나 드라마 제목을 검색해보세요</p>
            <SearchBar onSearch={handleSearch} placeholder="검색어를 입력하세요..." />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black">
        {/* 헤더 */}
        <div className="bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  &quot;{query}&quot; 검색 결과
                </h1>
                <p className="text-gray-400">
                  {isLoading ? '검색 중...' : `${results.length}개의 결과를 찾았습니다`}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialQuery={query}
                  placeholder="다른 검색어를 입력하세요..." 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* 타입 필터 */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">타입:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'movie' | 'tv')}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="all">전체</option>
                  <option value="movie">영화</option>
                  <option value="tv">드라마</option>
                </select>
              </div>

              {/* 정렬 */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">정렬:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'year' | 'title')}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="rating">평점순</option>
                  <option value="year">연도순</option>
                  <option value="title">제목순</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-400">검색 중...</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어를 시도해보세요</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {results.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleResultSelect(item)}
                  >
                    {/* 포스터 */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={getDisplayTitle(item)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-poster.jpg';
                        }}
                      />
                      
                      {/* 평점 */}
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-semibold">
                        {item.vote_average.toFixed(1)}
                      </div>
                      
                      {/* OTT 정보 */}
                      {item.ott_providers?.flatrate && item.ott_providers.flatrate.length > 0 && (
                        <div className="absolute bottom-2 left-2 flex space-x-1">
                          {item.ott_providers.flatrate.slice(0, 3).map((provider) => (
                            <img
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-6 h-6 rounded opacity-80"
                              title={provider.provider_name}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                        {getDisplayTitle(item)}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {getSubtitle(item)}
                      </p>
                      {item.overview && (
                        <p className="text-gray-300 text-sm line-clamp-3">
                          {item.overview}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <SearchResultsContent />;
} 