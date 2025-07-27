'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Play, Calendar, Clock, Globe, Info } from 'lucide-react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import OTTInfo from '@/components/OTTInfo';
import { OTTProvider } from '@/lib/ottUtils';
import { KoreanOTTProvider } from '@/lib/koreanOTTs';

interface ContentDetails {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres?: Array<{ id: number; name: string }>;
  media_type?: string;
  ott_providers?: OTTProvider[];
  korean_ott_providers?: KoreanOTTProvider[];
}

export default function ContentDetail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <ContentDetailContent />
    </Suspense>
  );
}

function ContentDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const mediaType = searchParams.get('type') || 'movie';
  
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // ID 유효성 검사
        if (!id || isNaN(parseInt(id, 10))) {
          throw new Error('유효하지 않은 콘텐츠 ID입니다.');
        }
        
        console.log(`콘텐츠 상세 정보 요청: ${mediaType} ${id}`);
        
        const response = await fetch(`/api/content/${id}?type=${mediaType}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '콘텐츠를 찾을 수 없습니다.');
        }
        
        // 응답 데이터 검증
        if (!data || !data.id) {
          throw new Error('유효하지 않은 콘텐츠 정보입니다.');
        }
        
        console.log(`콘텐츠 상세 정보 완료: ${mediaType} ${id}`, data);
        setContent(data);
      } catch (err) {
        console.error('Content fetch error:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id, mediaType]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="cinematic-spinner w-12 h-12"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">콘텐츠를 찾을 수 없습니다</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            onClick={handleBack}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-full font-medium hover:bg-[#FFA500] transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            뒤로 가기
          </motion.button>
        </div>
      </div>
    );
  }

  const title = content.title || content.name || '';
  const releaseYear = content.release_date?.split('-')[0] || content.first_air_date?.split('-')[0] || '';
  const runtime = content.runtime || content.episode_run_time?.[0] || 0;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const runtimeText = runtime > 0 ? `${hours}시간 ${minutes}분` : '정보 없음';

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* 배경 이미지 */}
      {content.backdrop_path && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          <Image
            src={`https://image.tmdb.org/t/p/original${content.backdrop_path}`}
            alt={title}
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
      )}

      {/* 헤더 */}
      <motion.header 
        className="relative z-10 bg-black/20 backdrop-blur-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handleBack}
              className="flex items-center text-white hover:text-[#FFD700] transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로 가기
            </motion.button>
            
            <motion.h1 
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[#FFD700]">토독</span>
              <span className="text-white">(Todok)</span>
            </motion.h1>
          </div>
        </div>
      </motion.header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 포스터 */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-8">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <Image
                  src={content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : '/placeholder-poster.jpg'}
                  alt={title}
                  width={500}
                  height={750}
                  className="w-full h-auto object-cover"
                  priority
                />
                
                {/* 미디어 타입 배지 */}
                <div className="absolute top-4 right-4 bg-[#FFD700] text-black text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                  {mediaType === 'movie' ? '영화' : '드라마'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 상세 정보 */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              {/* 제목 및 기본 정보 */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-6">
                  {content.vote_average && (
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-semibold">{content.vote_average.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">({content.vote_count}명 평가)</span>
                    </div>
                  )}
                  
                  {releaseYear && (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{releaseYear}</span>
                    </div>
                  )}
                  
                  {runtime > 0 && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{runtimeText}</span>
                    </div>
                  )}
                </div>

                {/* 장르 */}
                {content.genres && content.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {content.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 줄거리 */}
              {content.overview && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">줄거리</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {content.overview}
                  </p>
                </div>
              )}

              {/* OTT 정보 */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  시청 가능한 플랫폼
                </h3>
                <OTTInfo 
                  ottProviders={content.ott_providers}
                  koreanOTTProviders={content.korean_ott_providers}
                  title={title}
                />
              </div>

              {/* 액션 버튼들 */}
              <div className="flex flex-wrap gap-4 pt-6">
                <motion.button
                  className="bg-[#FFD700] text-black px-8 py-3 rounded-full font-medium hover:bg-[#FFA500] transition-colors duration-200 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  재생하기
                </motion.button>
                
                <motion.button
                  className="bg-white/10 text-white px-8 py-3 rounded-full font-medium hover:bg-white/20 transition-colors duration-200 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info className="w-5 h-5 mr-2" />
                  더 자세한 정보
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 