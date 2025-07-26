'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Play, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import OTTInfo from '@/components/OTTInfo';
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

    // DOM 변경 감지 및 에러 방지 (선택적 차단)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // 스크립트 태그 처리
              if (element.tagName === 'SCRIPT') {
                const src = element.getAttribute('src');
                if (src) {
                  // 문제가 되는 도메인만 차단
                  const blockedDomains = [
                    'ep2.adtrafficquality.google',
                    'www.google.com/recaptcha',
                    'googleads.g.doubleclick.net',
                    'pagead2.googlesyndication.com',
                    'securepubads.g.doubleclick.net'
                  ];
                  
                  const shouldBlock = blockedDomains.some(domain => 
                    src.includes(domain)
                  );
                  
                  if (shouldBlock) {
                    console.warn('문제 스크립트 차단:', src);
                    try {
                      element.remove();
                    } catch (e) {
                      console.warn('스크립트 제거 실패:', e);
                    }
                  } else {
                    console.log('허용된 스크립트:', src);
                  }
                }
              }
              
              // iframe 태그 처리
              if (element.tagName === 'IFRAME') {
                const src = element.getAttribute('src');
                if (src) {
                  const blockedDomains = [
                    'ep2.adtrafficquality.google',
                    'www.google.com/recaptcha',
                    'googleads.g.doubleclick.net',
                    'pagead2.googlesyndication.com'
                  ];
                  
                  const shouldBlock = blockedDomains.some(domain => 
                    src.includes(domain)
                  );
                  
                  if (shouldBlock) {
                    console.warn('문제 iframe 차단:', src);
                    try {
                      element.remove();
                    } catch (e) {
                      console.warn('iframe 제거 실패:', e);
                    }
                  } else {
                    console.log('허용된 iframe:', src);
                  }
                }
              }
            }
          });
        }
      });
    });

    // 더 빠른 감지를 위해 즉시 시작
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // body가 아직 없으면 DOMContentLoaded 대기
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }

    // 전역 에러 핸들러 강화
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        const message = event.error.message;
        if (message.includes('appendChild') || 
            message.includes('insertBefore') || 
            message.includes('removeChild') ||
            message.includes('Cannot read properties of null') ||
            message.includes('Cannot read properties of undefined')) {
          console.warn('DOM 에러 무시:', message);
          event.preventDefault();
          return false;
        }
      }
    };

    window.addEventListener('error', handleGlobalError, true);

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const fetchTVDetails = async () => {
      try {
        const { id } = await params;
        
        // ID 유효성 검사
        const tvId = parseInt(id);
        if (isNaN(tvId)) {
          setError('잘못된 TV 쇼 ID입니다.');
          setLoading(false);
          return;
        }
        
        // ID 범위 검사 (TMDB TV ID는 보통 1-999999 범위)
        if (tvId < 1 || tvId > 999999) {
          setError('존재하지 않는 TV 쇼입니다.');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/tv/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `API Error: ${response.status}`;
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // 데이터 유효성 검사
        if (!data || !data.name) {
          setError('유효하지 않은 TV 쇼 데이터입니다.');
          setLoading(false);
          return;
        }
        
        setTV(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching TV details:', error);
        setError(error instanceof Error ? error.message : '드라마 정보를 불러오는 중 오류가 발생했습니다.');
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(https://image.tmdb.org/t/p/original${tv.backdrop_path})`
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
            <img
              src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`}
              alt={tv.name}
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
            {tv.ott_providers && tv.ott_providers.length > 0 && (
              <OTTInfo ottProviders={tv.ott_providers} />
            )}
          </motion.div>
        </div>
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 