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

interface TVDetails {
  id: number;
  title?: string;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string }[];
    crew: { id: number; name: string; job: string }[];
  };
  ott_providers?: OTTProvider[];
}

export default function TVDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tv, setTV] = useState<TVDetails | null>(null);
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
    const fetchTVDetails = async () => {
      try {
        const { id } = await params;
        
        console.log('=== TV Detail Page 시작 ===');
        console.log('받은 ID:', id);
        console.log('URL 파라미터:', await params);
        
        // ID 유효성 검사
        const tvId = parseInt(id);
        if (isNaN(tvId)) {
          setError('유효하지 않은 TV 쇼 ID입니다.');
          setLoading(false);
          return;
        }

        // URL에서 media_type 확인 (기본값은 tv)
        const urlParams = new URLSearchParams(window.location.search);
        const mediaType = urlParams.get('type') as 'movie' | 'tv';
        
        // media_type 검증
        if (mediaType && mediaType !== 'movie' && mediaType !== 'tv') {
          throw new Error(`지원하지 않는 미디어 타입: ${mediaType}`);
        }
        
        console.log('미디어 타입:', mediaType || 'tv');
        
        // media_type에 따른 API 호출
        let tvData;
        if (mediaType === 'movie') {
          tvData = await fetch(`/api/movie/${tvId}`);
        } else {
          // 기본값은 tv
          tvData = await fetch(`/api/tv/${tvId}`);
        }
        
        if (!tvData.ok) {
          throw new Error(`API 요청 실패: ${tvData.status}`);
        }
        
        const tvDetails = await tvData.json();
        console.log('TV 상세 정보:', tvDetails);
        
        setTV(tvDetails);
        setLoading(false);
      } catch (error) {
        console.error('TV 상세 정보 가져오기 실패:', error);
        setError('TV 쇼 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchTVDetails();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error || !tv) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">드라마를 찾을 수 없습니다</h1>
          <p className="text-gray-400 mb-6">{error || '요청하신 드라마를 찾을 수 없습니다.'}</p>
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
  const voteAverage = tv.vote_average || 0;
  const voteCount = tv.vote_count || 0;

  return (
    <div className="min-h-screen bg-black">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${tv.backdrop_path})`
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
                              src={tv.poster_path}
              alt={tv.name}
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
            <h1 className="text-4xl font-bold text-white mb-4">{tv.name}</h1>
            
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
            {tv.overview && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {tv.overview}
              </p>
            )}

            {/* 메타데이터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {tv.first_air_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {new Date(tv.first_air_date).getFullYear()}
                  </span>
                </div>
              )}
              
              {tv.episode_run_time && tv.episode_run_time.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    {tv.episode_run_time[0]}분
                  </span>
                </div>
              )}
            </div>

            {/* 장르 */}
            {tv.genres && tv.genres.length > 0 && (
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-3">장르</h3>
                <div className="flex flex-wrap gap-2">
                  {tv.genres.map((genre) => (
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
            {tv.ott_providers && tv.ott_providers.length > 0 ? (
              <OTTInfo ottProviders={tv.ott_providers} />
            ) : (
              <div className="mb-8 p-6 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">시청 가능한 OTT가 없습니다</h3>
                    <p className="text-gray-400 text-sm">
                      현재 이 드라마는 국내 OTT 플랫폼에서 시청할 수 없습니다. 
                      방송 중이거나 아직 OTT 서비스에 공개되지 않았을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
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