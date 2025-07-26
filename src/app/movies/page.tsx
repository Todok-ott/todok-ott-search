'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Calendar, Film, Tv, Flame, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import { Movie } from '@/lib/tmdb';
import { getContentTag } from '@/lib/genreUtils';
import Image from 'next/image';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await fetch('/api/popular/movies');
        const data = await response.json();
        // 영화 데이터에 media_type 추가
        const moviesWithType = (data.results || []).map((movie: Movie) => ({
          ...movie,
          media_type: 'movie' as const
        }));
        setMovies(moviesWithType);
      } catch (error) {
        console.error('Error loading movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadMovies();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    window.location.href = `/movie/${movie.id}`;
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
              className="text-2xl font-bold text-white cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => window.location.href = '/'}
            >
              <span className="text-[#FFD700]">토독</span>
              <span className="text-white">(Todok)</span>
            </motion.h1>
            
            <motion.nav 
              className="hidden md:flex space-x-8 text-gray-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link href="/movies" className="text-[#FFD700] transition-colors duration-300 relative group">
                영화
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FFD700]"></span>
              </Link>
              <Link href="/tv" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                드라마
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/popular" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                인기
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/latest" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                신규
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/ott-comparison" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                OTT 비교
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* 광고 배너 - 영화 페이지 상단 */}
        <div className="w-full flex justify-center mb-8">
          <div style={{
            width: '100%',
            maxWidth: 728,
            height: 90,
            background: 'linear-gradient(45deg, #FF6B35, #E55A2B)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: '2px dashed #D84315',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            🎬 광고 영역 (샘플) - 영화 페이지
          </div>
        </div>

        {/* 페이지 헤더 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="text-[#FFD700]">영화</span> 목록
          </h2>
          <p className="text-gray-400">
            {loading ? '로딩 중...' : `${movies.length}개의 영화를 찾았습니다.`}
          </p>
        </motion.div>

        {/* 로딩 상태 */}
        {loading && (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="cinematic-spinner w-12 h-12"></div>
          </motion.div>
        )}

        {/* 영화 목록 */}
        {!loading && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
                onClick={() => handleMovieClick(movie)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-2xl poster-card">
                  <Image
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg'}
                    alt={movie.title}
                    width={500}
                    height={750}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-poster.jpg';
                    }}
                  />
                  
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-white font-semibold text-lg mb-2 truncate">
                        {movie.title || movie.name}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                        <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-[#FFD700] mr-1" />
                          <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      {movie.overview && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                          {movie.overview}
                        </p>
                      )}
                                             {/* 액션 버튼 */}
                       <div className="flex justify-center">
                         <button className="bg-white/20 text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors duration-200 flex items-center justify-center">
                           <Info className="w-4 h-4 mr-1" />
                           상세보기
                         </button>
                       </div>
                    </div>
                  </div>
                  
                  {/* 미디어 타입 배지 */}
                  <div className="absolute top-3 right-3 bg-[#FFD700] text-black text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                    {getContentTag(movie.genre_ids, movie.media_type)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 