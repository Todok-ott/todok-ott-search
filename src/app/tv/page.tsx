'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Info } from 'lucide-react';
import Footer from '@/components/Footer';
import { Movie } from '@/lib/tmdb';
import { getContentTag } from '@/lib/genreUtils';

export default function TVPage() {
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTVShows = async () => {
      try {
        const response = await fetch('/api/popular/tv');
        const data = await response.json();
        // TV 쇼 데이터에 media_type 추가
        const tvShowsWithType = (data.results || []).map((tvShow: Movie) => ({
          ...tvShow,
          media_type: 'tv' as const
        }));
        setTvShows(tvShowsWithType);
      } catch (error) {
        console.error('Error loading TV shows:', error);
        setTvShows([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTVShows();
  }, []);

  const handleTVShowClick = (tvShow: Movie) => {
    window.location.href = `/movie/${tvShow.id}`;
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
              <span className="text-[#FFD700]">CINEMA</span>
              <span className="text-white">SEARCH</span>
            </motion.h1>
            
            <motion.nav 
              className="hidden md:flex space-x-8 text-gray-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <a href="/movies" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                영화
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/tv" className="text-[#FFD700] transition-colors duration-300 relative group">
                드라마
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FFD700]"></span>
              </a>
              <a href="/popular" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                인기
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/latest" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                신규
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </a>
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="text-[#FFD700]">드라마</span> 목록
          </h2>
          <p className="text-gray-400">
            {loading ? '로딩 중...' : `${tvShows.length}개의 드라마를 찾았습니다.`}
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

        {/* 드라마 목록 */}
        {!loading && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {tvShows.map((tvShow, index) => (
              <motion.div
                key={tvShow.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
                onClick={() => handleTVShowClick(tvShow)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-2xl poster-card">
                  <img
                    src={tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : '/placeholder-poster.jpg'}
                    alt={tvShow.title || tvShow.name || ''}
                    className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-white font-semibold text-lg mb-2 truncate">
                        {tvShow.title || tvShow.name}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                        <span>{tvShow.first_air_date?.split('-')[0] || 'N/A'}</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-[#FFD700] mr-1" />
                          <span>{tvShow.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      {tvShow.overview && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                          {tvShow.overview}
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
                    {getContentTag(tvShow.genre_ids, tvShow.media_type)}
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