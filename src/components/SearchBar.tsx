'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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

interface SearchBarProps {
  onSearch: (query: string) => void;
  onResultSelect?: (movie: Movie) => void;
  placeholder?: string;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, onResultSelect, placeholder = "작품 제목을 입력하세요...", initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    // 디바운스 처리
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleResultClick = (movie: Movie) => {
    if (onResultSelect) {
      onResultSelect(movie);
    }
    setQuery('');
    setResults([]);
    // 상세 페이지로 이동
    window.location.href = `/movie/${movie.id}`;
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div 
          className="relative"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="w-full pl-16 pr-16 py-5 bg-black/30 backdrop-blur-md border border-red-500/60 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/70 transition-all duration-300 text-lg shadow-2xl"
          />
          {query && (
            <motion.button
              type="button"
              onClick={clearSearch}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          )}
        </motion.div>
      </form>

      {/* 검색 결과 드롭다운 */}
      <AnimatePresence>
        {isFocused && (results.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-4 bg-black/95 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-300 font-medium">검색 중...</p>
              </div>
            ) : (
              <div className="py-4">
                {results.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      scale: 1.01,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    className="flex items-center p-4 cursor-pointer hover:bg-[#FFD700]/10 transition-all duration-200 border-b border-gray-700/30 last:border-b-0"
                    onClick={() => handleResultClick(movie)}
                  >
                    <div className="w-16 h-24 rounded-lg overflow-hidden mr-4 flex-shrink-0 shadow-lg">
                      <Image
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : '/placeholder-poster.jpg'}
                        alt={movie.title || movie.name || ''}
                        width={64}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-lg truncate mb-1">
                        {movie.title || movie.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                        <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}</span>
                        <span>•</span>
                        <span>{movie.media_type === 'movie' ? '영화' : movie.media_type === 'tv' ? '드라마' : '기타'}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-[#FFD700] mr-1" />
                          <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      {movie.overview && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                          {movie.overview}
                        </p>
                      )}
                      {/* OTT 플랫폼 로고들 */}
                                                {movie.ott_providers?.flatrate && movie.ott_providers.flatrate.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 mr-2">시청 가능:</span>
                          {movie.ott_providers.flatrate.slice(0, 4).map((provider: { provider_id: number; provider_name: string; logo_path: string }) => (
                            <Image
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded opacity-60 hover:opacity-100 transition-opacity duration-200"
                              title={provider.provider_name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                                         {/* 액션 버튼 */}
                     <div className="ml-4">
                       <motion.button
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         className="bg-white/10 text-white text-xs px-3 py-2 rounded-full font-medium hover:bg-white/20 transition-colors duration-200 flex items-center"
                       >
                         <Clock className="w-3 h-3 mr-1" />
                         상세보기
                       </motion.button>
                     </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 