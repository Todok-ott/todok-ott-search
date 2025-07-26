'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Calendar, Film, Tv, Flame, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import { Movie } from '@/lib/tmdb';
import { getContentTag } from '@/lib/genreUtils';

export default function LatestPage() {
  const [latestContent, setLatestContent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestContent = async () => {
      try {
        // 최신 영화와 드라마를 가져오기 위해 trending API 사용
        const response = await fetch('/api/trending');
        const data = await response.json();
        
        // 최신 콘텐츠로 필터링 (최근 1년 내)
        const currentYear = new Date().getFullYear();
        const filtered = (data.results || []).filter((item: Movie) => {
          const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
          return year && parseInt(year) >= currentYear - 1;
        });
        
        // media_type이 없는 경우 기본값 설정
        const contentWithType = filtered.map((item: Movie) => ({
          ...item,
          media_type: item.media_type || (item.title ? 'movie' : 'tv')
        }));
        
        setLatestContent(contentWithType.slice(0, 20));
      } catch (error) {
        console.error('Error loading latest content:', error);
        setLatestContent([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadLatestContent();
  }, []);

  const handleContentClick = (content: Movie) => {
    window.location.href = `/movie/${content.id}`;
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
              <Link href="/movies" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                영화
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/tv" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                드라마
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/popular" className="hover:text-[#FFD700] transition-colors duration-300 relative group">
                인기
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/latest" className="text-[#FFD700] transition-colors duration-300 relative group">
                신규
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FFD700]"></span>
              </Link>
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
            <span className="text-[#FFD700]">신규</span> 콘텐츠
          </h2>
          <p className="text-gray-400">
            {loading ? '로딩 중...' : `${latestContent.length}개의 신규 콘텐츠를 찾았습니다.`}
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

        {/* 신규 콘텐츠 목록 */}
        {!loading && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {latestContent.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
                onClick={() => handleContentClick(content)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-2xl poster-card">
                  <img
                    src={content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : '/placeholder-poster.jpg'}
                    alt={content.title || content.name || ''}
                    className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-white font-semibold text-lg mb-2 truncate">
                        {content.title || content.name}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                        <span>{content.release_date?.split('-')[0] || content.first_air_date?.split('-')[0] || 'N/A'}</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-[#FFD700] mr-1" />
                          <span>{content.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      {content.overview && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                          {content.overview}
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
                    {getContentTag(content.genre_ids, content.media_type)}
                  </div>
                  
                  {/* 신규 배지 */}
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    신규
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