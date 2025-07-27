'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import OTTInfo from '@/components/OTTInfo';
import AdBanner from '@/components/AdBanner';
import Footer from '@/components/Footer';
import { OTTProvider } from '@/lib/ottUtils';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string }[];
    crew: { id: number; name: string; job: string }[];
  };
  ott_providers?: OTTProvider[];
}

export default function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
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
    const fetchMovieDetails = async () => {
      try {
        const { id } = await params;
        
        console.log('=== Movie Detail Page 시작 ===');
        console.log('받은 ID:', id);
        console.log('URL 파라미터:', await params);
        
        // ID 유효성 검사
        const movieId = parseInt(id);
        console.log('파싱된 movieId:', movieId);
        
        if (isNaN(movieId)) {
          console.error('잘못된 영화 ID:', id);
          setError('잘못된 영화 ID입니다.');
          setLoading(false);
          return;
        }
        
        // ID 범위 검사 (TMDB 영화 ID는 보통 1-9999999 범위)
        if (movieId < 1 || movieId > 9999999) {
          console.error('ID 범위 초과:', movieId);
          setError('존재하지 않는 영화입니다.');
          setLoading(false);
          return;
        }
        
        console.log('API 호출 시작:', `/api/movie/${id}`);
        
        // URL에서 제목 정보 추출 (예: /movie/244808?title=누키타시%20THE%20ANOMATION)
        const urlParams = new URLSearchParams(window.location.search);
        const titleParam = urlParams.get('title');
        
        // 제목 파라미터가 있으면 제목으로 검색, 없으면 ID로 검색
        const apiUrl = titleParam 
          ? `/api/movie/${id}?title=${encodeURIComponent(titleParam)}`
          : `/api/movie/${id}`;
        
        console.log('최종 API URL:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API 오류 응답:', errorData);
          const errorMessage = errorData.error || `API Error: ${response.status}`;
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('API 응답 데이터:', data);
        
        // TV 쇼 데이터인지 확인 (first_air_date가 있으면 TV 쇼)
        // 추가로 알려진 TV 쇼 ID들도 체크
        const knownTVShowIds = [1622, 1399, 1396, 1398]; // 슈퍼내추럴, 게임오브쓰론 등
        const isKnownTVShow = knownTVShowIds.includes(parseInt(id, 10));
        
        if (data.first_air_date && !data.release_date || isKnownTVShow) {
          console.log('TV 쇼 감지, TV 페이지로 리다이렉트:', data.name || data.title);
          // TV 페이지로 리다이렉트
          const tvUrl = `/tv/${id}${titleParam ? `?title=${encodeURIComponent(titleParam)}` : ''}`;
          router.replace(tvUrl);
          return;
        }
        
        // 데이터 유효성 검사
        if (!data || !data.title) {
          console.error('유효하지 않은 영화 데이터:', data);
          setError('유효하지 않은 영화 데이터입니다.');
          setLoading(false);
          return;
        }
        
        console.log('영화 데이터 설정 완료:', data.title);
        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(error instanceof Error ? error.message : '영화 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">영화를 찾을 수 없습니다</h1>
          <p className="text-gray-400 mb-6">{error || '요청하신 영화를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-yellow-500 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-400 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // 안전한 평점 처리
  const voteAverage = movie.vote_average || 0;
  const voteCount = movie.vote_count || 0;

  return (
    <div className="min-h-screen bg-black">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
        }}
      />

      {/* 헤더 */}
      <div className="relative z-10 p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-white hover:text-yellow-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로 가기</span>
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 포스터 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={500}
              height={750}
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-poster.jpg';
              }}
            />
          </motion.div>

          {/* 정보 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
            
            {/* 평점 */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-white text-xl font-semibold">
                  {voteAverage > 0 ? voteAverage.toFixed(1) : 'N/A'}
                </span>
              </div>
              {voteCount > 0 && (
                <span className="text-gray-400">({voteCount.toLocaleString()}명 평가)</span>
              )}
            </div>

            {/* 개요 */}
            {movie.overview && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {movie.overview}
              </p>
            )}

            {/* 메타데이터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {movie.release_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                </div>
              )}
              
              {movie.runtime && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {movie.runtime}분
                  </span>
                </div>
              )}
            </div>

            {/* 장르 */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-3">장르</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* OTT 정보 */}
            {movie.ott_providers && movie.ott_providers.length > 0 && (
              <OTTInfo ottProviders={movie.ott_providers} />
            )}
          </motion.div>
        </div>
      </div>

      {/* 푸터 - 항상 보이도록 수정 */}
      <div className="relative z-10 mt-16">
        <Footer />
      </div>
    </div>
  );
} 