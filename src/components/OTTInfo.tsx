'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Info, Star, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { OTTProvider } from '@/lib/ottUtils';

interface OTTInfoProps {
  ottProviders: OTTProvider[];
  title?: string;
}

export default function OTTInfo({ ottProviders, title = "시청 가능 플랫폼" }: OTTInfoProps) {
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  
  if (!ottProviders || ottProviders.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <div className="text-gray-400 text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>현재 시청 가능한 플랫폼 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 정렬된 OTT 목록
  const sortedOTTs = sortBy === 'price' 
    ? [...ottProviders].sort((a, b) => {
        const aPrice = a.price.monthly || a.price.basic || '₩0';
        const bPrice = b.price.monthly || b.price.basic || '₩0';
        return aPrice.localeCompare(bPrice);
      })
    : [...ottProviders].sort((a, b) => a.name.localeCompare(b.name));

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
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
            className="bg-black/50 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-[#FFD700]"
          >
            <option value="name">이름순</option>
            <option value="price">가격순</option>
          </select>
        </div>
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
              <img
                src={ott.logo}
                alt={ott.name}
                className="w-10 h-10 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/ott-logos/default.png';
                }}
              />
              <div className="flex-1">
                <h5 className="text-white font-medium">{ott.name}</h5>
                {ott.price && (
                  <p className="text-[#FFD700] text-sm">
                    {ott.price.monthly || ott.price.basic || '가격 정보 없음'}
                  </p>
                )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[#FFD700] font-semibold">{ottProviders.length}</p>
            <p className="text-gray-400 text-sm">총 플랫폼</p>
          </div>
          <div>
            <p className="text-[#FFD700] font-semibold">
              {ottProviders.filter(ott => ott.price && (ott.price.monthly || ott.price.basic)).length}
            </p>
            <p className="text-gray-400 text-sm">유료 서비스</p>
          </div>
          <div>
            <p className="text-[#FFD700] font-semibold">
              {ottProviders.filter(ott => !ott.price || (!ott.price.monthly && !ott.price.basic)).length}
            </p>
            <p className="text-gray-400 text-sm">무료 서비스</p>
          </div>
        </div>
      </div>
    </div>
  );
} 