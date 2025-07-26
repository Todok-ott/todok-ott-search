'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Play, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import OTTInfo from '@/components/OTTInfo';
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

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/movie/${id}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 데이터 유효성 검사
        if (!data || !data.title) {
          throw new Error('유효하지 않은 영화 데이터입니다.');
        }
        
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(error instanceof Error ? error.message : '영화 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
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
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
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

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 