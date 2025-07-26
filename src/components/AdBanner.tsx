'use client';

import { motion } from 'framer-motion';

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar';
  className?: string;
}

export default function AdBanner({ position, className = '' }: AdBannerProps) {
  const getAdContent = () => {
    switch (position) {
      case 'top':
        return {
          title: '🎬 최신 영화 정보',
          description: 'OTT Search에서 실시간으로 업데이트되는 최신 영화 정보를 확인하세요!',
          cta: '지금 확인하기'
        };
      case 'bottom':
        return {
          title: '📺 인기 드라마 추천',
          description: '사용자들이 가장 많이 검색하는 인기 드라마를 추천해드립니다.',
          cta: '더 보기'
        };
      case 'sidebar':
        return {
          title: '⭐ 프리미엄 서비스',
          description: '광고 없는 깔끔한 검색 경험을 원하시나요?',
          cta: '업그레이드'
        };
      default:
        return {
          title: '광고',
          description: '광고 내용',
          cta: '클릭'
        };
    }
  };

  const adContent = getAdContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">
            {adContent.title}
          </h4>
          <p className="text-gray-300 text-xs mb-2">
            {adContent.description}
          </p>
          <motion.button 
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1 rounded-full font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {adContent.cta}
          </motion.button>
        </div>
        <div className="text-xs text-gray-400 ml-4">
          광고
        </div>
      </div>
    </motion.div>
  );
} 