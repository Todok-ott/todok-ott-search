'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Play, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import OTTInfo from '@/components/OTTInfo';
import { CombinedOTTInfo } from '@/lib/ottUtils';

interface TVDetails {
  id: number;
  title?: string;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string }[];
    crew: { id: number; name: string; job: string }[];
  };
  ott_providers?: CombinedOTTInfo[];
}

export default function TVDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tv, setTV] = useState<TVDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVDetails = async () => {
      try {
        const response = await fetch(`/api/tv/${params.id}`);
        const data = await response.json();
        setTV(data);
      } catch (error) {
        console.error('Error fetching TV details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!tv) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">드라마를 찾을 수 없습니다.</div>
      </div>
    );
  }

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
              className="w-full rounded-xl shadow-2xl"
            />
          </motion.div>

          {/* 상세 정보 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{tv.name}</h1>
              
              <div className="flex items-center space-x-4 text-gray-300 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span>{tv.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{tv.first_air_date?.split('-')[0] || 'N/A'}</span>
                </div>
                {tv.episode_run_time && tv.episode_run_time[0] && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{tv.episode_run_time[0]}분</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {tv.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-yellow-500 text-black text-sm rounded-full font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                {tv.overview || '줄거리 정보가 없습니다.'}
              </p>
            </div>

            {/* OTT 정보 */}
            {tv.ott_providers && tv.ott_providers.length > 0 && (
              <OTTInfo ottProviders={tv.ott_providers} />
            )}

            {/* 액션 버튼 */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>시청하기</span>
              </motion.button>
            </div>

            {/* 출연진 */}
            {tv.credits?.cast && tv.credits.cast.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4">출연진</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tv.credits.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      <img
                        src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : '/placeholder-avatar.jpg'}
                        alt={actor.name}
                        className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                      />
                      <p className="text-white text-sm font-medium">{actor.name}</p>
                      <p className="text-gray-400 text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 