'use client';

import { motion } from 'framer-motion';
import { Star, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { OTTProvider } from '@/lib/ottUtils';
import { KoreanOTTProvider } from '@/lib/koreanOTTs';

interface OTTInfoProps {
  ottProviders?: OTTProvider[];
  koreanOTTProviders?: KoreanOTTProvider[];
  title?: string;
}

export default function OTTInfo({ ottProviders = [], koreanOTTProviders = [], title = "시청 가능 플랫폼" }: OTTInfoProps) {
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  
  // KoreanOTTProvider를 OTTProvider 형식으로 변환
  const convertedKoreanProviders: OTTProvider[] = koreanOTTProviders.map(provider => ({
    id: provider.name.toLowerCase().replace(/\s+/g, '-'),
    name: provider.name,
    logo: provider.logo,
    description: `${provider.name}에서 시청 가능합니다`,
    features: ['VOD 서비스', '다중 프로필', '오프라인 시청'],
    strengths: ['다양한 콘텐츠', '고품질 화질'],
    weaknesses: ['구독료 발생'],
    availableContent: []
  }));
  
  // 모든 OTT 제공자 결합
  const allProviders = [...ottProviders, ...convertedKoreanProviders];
  
  // 시청가능 플랫폼이 없으면 아무것도 표시하지 않음
  if (!allProviders || allProviders.length === 0) {
    return null;
  }

  // 이름순으로 정렬된 OTT 목록
  const sortedOTTs = [...allProviders].sort((a, b) => a.name.localeCompare(b.name));

  const toggleDetails = (ottId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [ottId]: !prev[ottId]
    }));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      {/* OTT 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedOTTs.map((ott, index) => (
          <motion.div
            key={ott.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-black/20 border border-gray-600/20 rounded-lg p-4 hover:border-gray-500/30 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Image
                src={ott.logo}
                alt={ott.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded object-cover"
                onError={() => {
                  // Next.js Image에서는 onError 대신 fallback 이미지 사용
                }}
              />
              <div className="flex-1">
                <h5 className="text-white font-medium">{ott.name}</h5>
              </div>
              <button
                onClick={() => toggleDetails(ott.id)}
                className="text-gray-400 hover:text-[#FFD700] transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* 상세 정보 */}
            {showDetails[ott.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-gray-600/20"
              >
                {/* 설명 */}
                {ott.description && (
                  <div>
                    <h6 className="text-gray-300 text-sm font-medium mb-1">설명</h6>
                    <p className="text-gray-400 text-xs">{ott.description}</p>
                  </div>
                )}

                {/* 특징 */}
                {ott.features && ott.features.length > 0 && (
                  <div>
                    <h6 className="text-gray-300 text-sm font-medium mb-1">특징</h6>
                    <div className="flex flex-wrap gap-1">
                      {ott.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#FFD700]/20 text-[#FFD700] text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 장점 */}
                {ott.strengths && ott.strengths.length > 0 && (
                  <div>
                    <h6 className="text-gray-300 text-sm font-medium mb-1 flex items-center">
                      <Star className="w-3 h-3 mr-1 text-green-400" />
                      장점
                    </h6>
                    <ul className="text-gray-400 text-xs space-y-1">
                      {ott.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-400 mr-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 단점 */}
                {ott.weaknesses && ott.weaknesses.length > 0 && (
                  <div>
                    <h6 className="text-gray-300 text-sm font-medium mb-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 text-yellow-400" />
                      단점
                    </h6>
                    <ul className="text-gray-400 text-xs space-y-1">
                      {ott.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-yellow-400 mr-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 통계 정보 */}
      <div className="mt-6 p-4 bg-black/20 border border-gray-600/20 rounded-lg">
        <div className="grid grid-cols-1 gap-4 text-center">
          <div>
            <p className="text-[#FFD700] font-semibold">{ottProviders.length}</p>
            <p className="text-gray-400 text-sm">시청 가능 플랫폼</p>
          </div>
        </div>
      </div>
    </div>
  );
} 