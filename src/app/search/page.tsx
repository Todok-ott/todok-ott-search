'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Play, Info, Filter, SortAsc, SortDesc } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import { Movie } from '@/lib/tmdb';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year' | 'title'>('relevance');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, sortBy, filterType]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      let filteredResults = data.results || [];
      
      // 타입 필터링
      if (filterType !== 'all') {
        filteredResults = filteredResults.filter((item: Movie) => 
          item.media_type === filterType
        );
      }
      
      // 정렬
      filteredResults.sort((a: Movie, b: Movie) => {
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
  };

  const handleResultSelect = (movie: Movie) => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* 헤더 */}
      <motion.header 
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-600/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[#FFD700]">CINEMA</span>
              <span className="text-white">SEARCH</span>
            </motion.h1>
            
            <div className="flex items-center space-x-4">
              <SearchBar 
                onSearch={handleSearch}
                onResultSelect={handleResultSelect}
                placeholder="다른 작품을 검색하세요..."
              />
              
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-white/10 rounded-lg hover:bg-[#FFD700] hover:text-black transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/80 backdrop-blur-sm border-b border-gray-600/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'relevance' | 'rating' | 'year' | 'title')}
                    className="bg-white/10 text-white border border-gray-600/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                  >
                    <option value="relevance">관련도</option>
                    <option value="rating">평점</option>
                    <option value="year">연도</option>
                    <option value="title">제목</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">타입:</span>
                  <div className="flex space-x-2">
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
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-2xl poster-card">
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder-poster.jpg'}
                        alt={item.title || item.name || ''}
                        className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="text-white font-semibold text-lg mb-2 truncate">
                            {item.title || item.name}
                          </h4>
                          <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                            <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-[#FFD700] mr-1" />
                              <span>{item.vote_average.toFixed(1)}</span>
                            </div>
                          </div>
                          {item.overview && (
                            <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                              {item.overview}
                            </p>
                          )}
                          {/* 액션 버튼들 */}
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-[#FFD700] text-black text-sm px-3 py-2 rounded-full font-medium hover:bg-[#FFA500] transition-colors duration-200 flex items-center justify-center">
                              <Play className="w-4 h-4 mr-1" />
                              재생
                            </button>
                            <button className="flex-1 bg-white/20 text-white text-sm px-3 py-2 rounded-full font-medium hover:bg-white/30 transition-colors duration-200 flex items-center justify-center">
                              <Info className="w-4 h-4 mr-1" />
                              정보
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* 미디어 타입 배지 */}
                      <div className="absolute top-3 right-3 bg-[#FFD700] text-black text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        {item.media_type === 'movie' ? '영화' : '드라마'}
                      </div>
                      
                      {/* OTT 플랫폼 로고들 */}
                      {item.ott_providers?.flatrate && (
                        <div className="absolute bottom-3 left-3 flex space-x-1">
                          {item.ott_providers.flatrate.slice(0, 3).map((provider: { provider_id: number; provider_name: string; logo_path: string }) => (
                            <img
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-6 h-6 rounded opacity-80 hover:opacity-100 transition-opacity duration-200"
                              title={provider.provider_name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    검색 결과를 찾을 수 없습니다
                  </h3>
                  <p className="text-gray-400 mb-6">
                    다른 키워드로 검색해보시거나, 인기 콘텐츠를 확인해보세요.
                  </p>
                  <motion.button
                    onClick={() => window.history.back()}
                    className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-medium hover:bg-[#FFA500] transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    다시 검색하기
                  </motion.button>
                </div>
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