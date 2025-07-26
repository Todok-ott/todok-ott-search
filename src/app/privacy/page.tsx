'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* 헤더 */}
      <motion.header 
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-600/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold text-white cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => window.location.href = '/'}
            >
              <span className="text-[#FFD700]">CINEMA</span>
              <span className="text-white">SEARCH</span>
            </motion.h1>
            
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-[#FFD700] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>뒤로 가기</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-gray-600/20"
        >
          <h1 className="text-4xl font-bold text-white mb-8">
            <span className="text-[#FFD700]">개인정보처리방침</span>
          </h1>
          
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. 개인정보 수집 및 이용</h2>
              <p>
                Cinema Search는 사용자의 개인정보를 최소한으로 수집하며, 서비스 제공을 위한 목적으로만 이용합니다.
                수집하는 정보는 검색 쿼리와 기본적인 사용 통계에 한정됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. 개인정보 보호</h2>
              <p>
                당사는 사용자의 개인정보를 안전하게 보호하기 위해 최선을 다하고 있습니다.
                개인정보는 암호화되어 저장되며, 무단 접근을 방지하기 위한 보안 조치를 취하고 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. 쿠키 및 추적 기술</h2>
              <p>
                본 웹사이트는 사용자 경험 향상을 위해 쿠키를 사용할 수 있습니다.
                브라우저 설정에서 쿠키 사용을 제한할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. 개인정보 공유</h2>
              <p>
                당사는 법적 요구사항이 있는 경우를 제외하고는 사용자의 개인정보를 제3자와 공유하지 않습니다.
                TMDB API를 통해 영화 정보를 제공하지만, 개인정보는 전송되지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. 문의 및 연락처</h2>
              <p>
                개인정보처리방침에 대한 문의사항이 있으시면 언제든지 연락해 주시기 바랍니다.
                이메일: privacy@cinemasearch.com
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 