'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Check, X, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

interface OTTService {
  id: string;
  name: string;
  logo: string;
  description: string;
  price: string;
  features: string[];
  strengths: string[];
  weaknesses: string[];
  rating: number;
}

const ottServices: OTTService[] = [
  {
    id: 'netflix',
    name: '넷플릭스',
    logo: '🎬',
    description: '글로벌 최고의 스트리밍 서비스',
    price: '월 17,000원',
    features: ['4K HDR', '다운로드', '동시시청 4명', '광고없음'],
    strengths: ['다양한 오리지널 콘텐츠', '글로벌 콘텐츠', '고화질 스트리밍'],
    weaknesses: ['한국 콘텐츠 제한적', '월 구독료 비쌈'],
    rating: 4.5
  },
  {
    id: 'wavve',
    name: '웨이브',
    logo: '🌊',
    description: 'KBS, MBC, SBS 콘텐츠 전문',
    price: '월 13,900원',
    features: ['4K', '다운로드', '동시시청 2명', '광고있음'],
    strengths: ['한국 드라마/예능 풍부', '실시간 방송', '합리적인 가격'],
    weaknesses: ['해외 콘텐츠 부족', '광고 포함'],
    rating: 4.2
  },
  {
    id: 'tving',
    name: '티빙',
    logo: '📺',
    description: 'tvN, JTBC 콘텐츠 전문',
    price: '월 13,900원',
    features: ['4K', '다운로드', '동시시청 2명', '광고있음'],
    strengths: ['tvN 드라마 전문', '예능 콘텐츠', '실시간 방송'],
    weaknesses: ['해외 콘텐츠 부족', '광고 포함'],
    rating: 4.3
  },
  {
    id: 'disney',
    name: '디즈니+',
    logo: '🏰',
    description: '디즈니, 마블, 스타워즈 콘텐츠',
    price: '월 9,900원',
    features: ['4K HDR', '다운로드', '동시시청 4명', '광고없음'],
    strengths: ['디즈니 콘텐츠 전문', '가족 친화적', '합리적인 가격'],
    weaknesses: ['한국 콘텐츠 부족', '콘텐츠 다양성 제한'],
    rating: 4.4
  },
  {
    id: 'watcha',
    name: '왓챠',
    logo: '👁️',
    description: '독립영화, 예술영화 전문',
    price: '월 12,900원',
    features: ['4K', '다운로드', '동시시청 1명', '광고없음'],
    strengths: ['독립영화 전문', '예술영화 풍부', '한국 영화'],
    weaknesses: ['메이저 콘텐츠 부족', '동시시청 제한'],
    rating: 4.0
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    logo: '🍎',
    description: '애플 오리지널 콘텐츠',
    price: '월 6,500원',
    features: ['4K HDR', '다운로드', '동시시청 6명', '광고없음'],
    strengths: ['고품질 오리지널', '가족 공유', '저렴한 가격'],
    weaknesses: ['콘텐츠 수량 적음', '한국 콘텐츠 부족'],
    rating: 4.1
  }
];

export default function OTTComparison() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            OTT 서비스 비교
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            한국의 주요 OTT 서비스들을 비교하고 최적의 서비스를 찾아보세요
          </p>
        </motion.div>

        {/* OTT 서비스 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ottServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                selectedService === service.id 
                  ? 'border-yellow-500/50 bg-yellow-500/10' 
                  : 'hover:border-yellow-500/30 hover:bg-yellow-500/5'
              }`}
              onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
            >
              {/* 서비스 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{service.logo}</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">{service.name}</h3>
                    <p className="text-gray-400 text-sm">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-white text-sm">{service.rating}</span>
                </div>
              </div>

              {/* 가격 */}
              <div className="mb-4">
                <span className="text-yellow-500 font-bold text-lg">{service.price}</span>
              </div>

              {/* 특징 */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">주요 특징</h4>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* 장점/단점 */}
              {selectedService === service.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      장점
                    </h4>
                    <ul className="space-y-1">
                      {service.strengths.map((strength, idx) => (
                        <li key={idx} className="text-green-400 text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <X className="w-4 h-4 text-red-500 mr-2" />
                      단점
                    </h4>
                    <ul className="space-y-1">
                      {service.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-red-400 text-sm">• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 추천 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">추천 조합</h2>
            <p className="text-gray-300">최적의 시청 경험을 위한 OTT 조합을 추천합니다</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-3">기본 조합</h3>
              <p className="text-gray-300 text-sm mb-4">한국 콘텐츠 중심</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white">웨이브</span>
                  <span className="text-yellow-500">13,900원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">티빙</span>
                  <span className="text-yellow-500">13,900원</span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">총 월 구독료</span>
                    <span className="text-yellow-500">27,800원</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-3">프리미엄 조합</h3>
              <p className="text-gray-300 text-sm mb-4">글로벌 + 한국 콘텐츠</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white">넷플릭스</span>
                  <span className="text-yellow-500">17,000원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">웨이브</span>
                  <span className="text-yellow-500">13,900원</span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">총 월 구독료</span>
                    <span className="text-yellow-500">30,900원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  );
} 