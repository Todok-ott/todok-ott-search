'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import GoogleAdSense from '@/components/GoogleAdSense';
import AmazonAssociates from '@/components/AmazonAssociates';
import { getAdsByPosition } from '@/lib/adUtils';

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
  const [popularMovies, setPopularMovies] = useState<PopularContent[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<PopularContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerAds] = useState(() => getAdsByPosition('header'));
  const [contentAds] = useState(() => getAdsByPosition('content'));

  useEffect(() => {
    const fetchPopularContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching popular content...');
        
        const [moviesResponse, tvResponse] = await Promise.all([
          fetch('/api/popular/movies'),
          fetch('/api/popular/tv')
        ]);

        console.log('Movies response status:', moviesResponse.status);
        console.log('TV response status:', tvResponse.status);

        if (!moviesResponse.ok) {
          throw new Error(`Movies API error: ${moviesResponse.status}`);
        }
        
        if (!tvResponse.ok) {
          throw new Error(`TV API error: ${tvResponse.status}`);
        }

        const moviesData = await moviesResponse.json();
        const tvData = await tvResponse.json();

        console.log('Movies data:', moviesData);
        console.log('TV data:', tvData);

        setPopularMovies(moviesData.results?.slice(0, 6) || fallbackMovies);
        setPopularTVShows(tvData.results?.slice(0, 6) || fallbackTVShows);
      } catch (error) {
        console.error('Error fetching popular content:', error);
        setError('콘텐츠를 불러오는 중 오류가 발생했습니다.');
        // 에러 발생 시 임시 데이터 사용
        setPopularMovies(fallbackMovies);
        setPopularTVShows(fallbackTVShows);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularContent();
  }, []);

  const handleContentClick = (item: PopularContent) => {
    window.location.href = `/${item.media_type}/${item.id}`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(https://image.tmdb.org/t/p/original/9yBVqNruk6YfxthWQNstnKOfTqA.jpg)'
        }}
      />

      {/* 헤더 광고 */}
      {headerAds.length > 0 && (
        <div className="relative z-10 p-4">
          {headerAds.map((ad) => (
            ad.type === 'adsense' ? (
              <GoogleAdSense
                key={ad.id}
                adSlot={ad.adSlot || ''}
                adFormat={ad.adFormat as 'auto' | 'rectangle' | 'banner' | 'leaderboard'}
                className="mb-4"
              />
            ) : ad.type === 'amazon' && ad.productData ? (
              <AmazonAssociates
                key={ad.id}
                productTitle={ad.productData.title}
                productImage={ad.productData.image}
                productPrice={ad.productData.price}
                amazonUrl={ad.productData.url}
                className="mb-4"
              />
            ) : null
          ))}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex-1">
        {/* 히어로 섹션 */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              토독
              <span className="text-yellow-500 text-3xl md:text-5xl ml-4">(Todok)</span>
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
              className="mb-12"
            >
              <SearchBar 
                onSearch={(query) => {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }}
                onResultSelect={(movie) => {
                  window.location.href = `/movie/${movie.id}`;
                }}
              />
            </motion.div>

            {/* 스크롤 인디케이터 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-3 bg-white rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 인기 콘텐츠 섹션 */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
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
                  <h3 className="text-2xl font-bold text-white mb-6">인기 영화</h3>
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
                          <img
                            src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
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
                                <span>{movie.vote_average.toFixed(1)}</span>
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
                  <h3 className="text-2xl font-bold text-white mb-6">인기 드라마</h3>
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
                          <img
                            src={show.poster_path.startsWith('http') ? show.poster_path : `https://image.tmdb.org/t/p/w500${show.poster_path}`}
                            alt={show.name || show.title}
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
                                <span>{show.vote_average.toFixed(1)}</span>
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

            {/* 콘텐츠 광고 */}
            {contentAds.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mt-12"
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">추천 상품</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contentAds.map((ad) => (
                    ad.type === 'amazon' && ad.productData ? (
                      <AmazonAssociates
                        key={ad.id}
                        productTitle={ad.productData.title}
                        productImage={ad.productData.image}
                        productPrice={ad.productData.price}
                        amazonUrl={ad.productData.url}
                      />
                    ) : null
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
