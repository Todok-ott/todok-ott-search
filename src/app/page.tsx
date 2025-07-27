'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Film, Tv, Flame, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import Image from 'next/image';

interface PopularContent {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
}

interface ContentResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
}

// 임시 데이터
const fallbackMovies: PopularContent[] = [
  {
    id: 1,
    title: "인터스텔라",
    overview: "우주를 배경으로 한 SF 영화",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.6,
    release_date: "2014",
    media_type: "movie"
  },
  {
    id: 2,
    title: "듄",
    overview: "사막 행성 아라키스의 이야기",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.0,
    release_date: "2021",
    media_type: "movie"
  },
  {
    id: 3,
    title: "오펜하이머",
    overview: "원자폭탄 개발의 역사",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.4,
    release_date: "2023",
    media_type: "movie"
  }
];

const fallbackTVShows: PopularContent[] = [
  {
    id: 4,
    title: "스트레인저 씽즈",
    name: "스트레인저 씽즈",
    overview: "초자연적 현상을 다루는 드라마",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.7,
    release_date: "2016",
    first_air_date: "2016",
    media_type: "tv"
  },
  {
    id: 5,
    title: "브레이킹 배드",
    name: "브레이킹 배드",
    overview: "화학 교사의 범죄 이야기",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 9.5,
    release_date: "2008",
    first_air_date: "2008",
    media_type: "tv"
  },
  {
    id: 6,
    title: "게임 오브 스론즈",
    name: "게임 오브 스론즈",
    overview: "판타지 세계의 권력 다툼",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 9.3,
    release_date: "2011",
    first_air_date: "2011",
    media_type: "tv"
  }
];

export default function Home() {
  const [popularMovies, setPopularMovies] = useState<PopularContent[]>(fallbackMovies);
  const [popularTVShows, setPopularTVShows] = useState<PopularContent[]>(fallbackTVShows);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 전역 에러 핸들러 추가
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // appendChild 에러 처리
      if (event.error && event.error.message && event.error.message.includes('appendChild')) {
        console.warn('appendChild 에러 무시:', event.error);
        event.preventDefault();
        return false;
      }
      
      // null 참조 에러 처리
      if (event.error && event.error.message && event.error.message.includes('Cannot read properties of null')) {
        console.warn('null 참조 에러 무시:', event.error);
        event.preventDefault();
        return false;
      }
      
      // undefined 참조 에러 처리
      if (event.error && event.error.message && event.error.message.includes('Cannot read properties of undefined')) {
        console.warn('undefined 참조 에러 무시:', event.error);
        event.preventDefault();
        return false;
      }
      
      // 기타 DOM 관련 에러 처리
      if (event.error && event.error.message && (
        event.error.message.includes('insertBefore') ||
        event.error.message.includes('removeChild') ||
        event.error.message.includes('replaceChild')
      )) {
        console.warn('DOM 조작 에러 무시:', event.error);
        event.preventDefault();
        return false;
      }
    };

    // unhandledrejection 에러도 처리
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('처리되지 않은 Promise 거부:', event.reason);
      event.preventDefault();
    };



    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const fetchPopularContent = async () => {
      try {
        setLoading(true);
        setError(null);
        setPopularMovies(fallbackMovies);
        setPopularTVShows(fallbackTVShows);

        // 인기 영화/TV 20개씩 받아옴
        const [moviesResponse, tvResponse] = await Promise.all([
          fetch('/api/popular/movies'),
          fetch('/api/popular/tv')
        ]);
        if (!moviesResponse.ok || !tvResponse.ok) throw new Error('API 오류');
        const moviesData = await moviesResponse.json();
        const tvData = await tvResponse.json();

        // 상세 fetch 함수 (OTT 정보 포함)
        const fetchMovieDetail = async (id: number) => {
          try {
            const res = await fetch(`/api/content/${id}?type=movie`);
            if (!res.ok) return null;
            const data = await res.json();
            return data && !data.error ? data : null;
          } catch { return null; }
        };
        const fetchTVDetail = async (id: number) => {
          try {
            const res = await fetch(`/api/content/${id}?type=tv`);
            if (!res.ok) return null;
            const data = await res.json();
            return data && !data.error ? data : null;
          } catch { return null; }
        };

        // 인기 영화/TV 중 최대 6개만 사용 (OTT 정보 체크 제거)
        const validMovies: PopularContent[] = moviesData.results.slice(0, 6).map((movie: ContentResult) => ({
          id: movie.id,
          title: movie.title || '',
          name: movie.name,
          overview: movie.overview,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date || '',
          first_air_date: movie.first_air_date,
          media_type: 'movie'
        }));
        
        const validTVs: PopularContent[] = tvData.results.slice(0, 6).map((tv: ContentResult) => ({
          id: tv.id,
          title: tv.title || '',
          name: tv.name,
          overview: tv.overview,
          poster_path: tv.poster_path,
          vote_average: tv.vote_average,
          release_date: tv.release_date || '',
          first_air_date: tv.first_air_date,
          media_type: 'tv'
        }));
        setPopularMovies(validMovies);
        setPopularTVShows(validTVs);
      } catch (error) {
        setError('콘텐츠를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPopularContent();
  }, []);

  const handleContentClick = (item: PopularContent) => {
    try {
      const path = item.media_type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
      window.location.href = path;
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // 에러가 발생한 경우 기본 페이지 표시
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">토독 (Todok)</h1>
          <p className="text-xl mb-8">OTT 검색 서비스</p>
          <p className="text-gray-400 mb-4">일시적인 오류가 발생했습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-yellow-500 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-400 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 카테고리 네비게이션 */}
      <nav className="bg-black/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold text-white"
              >
                토독 <span className="text-yellow-500">(Todok)</span>
              </motion.div>
            </Link>

            {/* 카테고리 메뉴 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/movies" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Film className="w-5 h-5" />
                <span>영화</span>
              </Link>
              <Link href="/tv" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Tv className="w-5 h-5" />
                <span>드라마</span>
              </Link>
              <Link href="/popular" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Flame className="w-5 h-5" />
                <span>인기</span>
              </Link>
              <Link href="/latest" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
                <span>최신</span>
              </Link>
              <Link href="/ott-comparison" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Info className="w-5 h-5" />
                <span>OTT 비교</span>
              </Link>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative min-h-[40vh] flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            토독 <span className="text-yellow-500">(Todok)</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            원하는 콘텐츠를 어디서 볼 수 있는지 한눈에 확인하세요
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <SearchBar 
              onSearch={(query) => {
                try {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                } catch (error) {
                  console.error('Search navigation error:', error);
                }
              }}
              onResultSelect={(movie) => {
                try {
                  window.location.href = `/movie/${movie.id}`;
                } catch (error) {
                  console.error('Movie navigation error:', error);
                }
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* 인기 콘텐츠 섹션 */}
      <section id="popular-content" className="py-2 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 광고 배너 - 인기 콘텐츠 섹션 상단 */}
          <div className="w-full flex justify-center mb-8">
            <div style={{
              width: '100%',
              maxWidth: 728,
              height: 90,
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: '2px dashed #2E7D32',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              🎬 광고 영역 (샘플) - 메인 페이지
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 mr-3 text-yellow-500" />
              인기 콘텐츠
            </h2>
            <p className="text-gray-400 text-lg">지금 가장 인기 있는 영화와 드라마</p>
          </motion.div>

          {/* 로딩 상태 */}
          {loading && (
            <motion.div 
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="cinematic-spinner w-12 h-12"></div>
              <span className="text-white ml-4">콘텐츠를 불러오는 중...</span>
            </motion.div>
          )}

          {/* 에러 상태 */}
          {error && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-500 text-2xl">⚠️</span>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  {error} (임시 데이터를 표시합니다)
                </p>
              </div>
            </motion.div>
          )}

          {/* 콘텐츠 표시 */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 인기 영화 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularMovies.length > 0 ? (
                    popularMovies.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-black/20 border border-gray-600/20 rounded-lg overflow-hidden hover:border-yellow-500/30 transition-colors cursor-pointer"
                        onClick={() => handleContentClick(movie)}
                      >
                        <Image
                          src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          width={500}
                          height={720}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-poster.jpg';
                          }}
                        />
                        <div className="p-4">
                          <h4 className="text-white font-semibold mb-2 line-clamp-2">
                            {movie.title}
                          </h4>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                            </div>
                            <span>{movie.release_date?.split('-')[0]}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-400">영화 정보를 불러올 수 없습니다.</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 인기 드라마 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularTVShows.length > 0 ? (
                    popularTVShows.map((show, index) => (
                      <motion.div
                        key={show.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-black/20 border border-gray-600/20 rounded-lg overflow-hidden hover:border-yellow-500/30 transition-colors cursor-pointer"
                        onClick={() => handleContentClick(show)}
                      >
                        <Image
                          src={show.poster_path.startsWith('http') ? show.poster_path : `https://image.tmdb.org/t/p/w500${show.poster_path}`}
                          alt={show.name || show.title}
                          width={500}
                          height={720}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-poster.jpg';
                          }}
                        />
                        <div className="p-4">
                          <h4 className="text-white font-semibold mb-2 line-clamp-2">
                            {show.name || show.title}
                          </h4>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span>{show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</span>
                            </div>
                            <span>{show.first_air_date?.split('-')[0]}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-400">드라마 정보를 불러올 수 없습니다.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
