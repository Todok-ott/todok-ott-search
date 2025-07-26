'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
                              <span className="text-[#FFD700]">토독</span> <span className="text-white">(Todok)</span>
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
            <span className="text-[#FFD700]">이용약관</span>
          </h1>
          
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. 서비스 이용</h2>
              <p>
                토독 (Todok)은 영화 및 드라마 정보 검색 서비스를 제공합니다.
                사용자는 본 서비스를 개인적인 용도로만 이용할 수 있으며, 상업적 목적으로 사용할 수 없습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. 서비스 내용</h2>
              <p>
                본 서비스는 TMDB API를 통해 제공되는 영화 및 드라마 정보를 검색하고 표시합니다.
                제공되는 정보의 정확성은 TMDB의 데이터에 의존하며, 당사는 정보의 정확성을 보장하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. 사용자 의무</h2>
              <p>
                사용자는 서비스 이용 시 다음 사항을 준수해야 합니다:
                - 타인의 권리를 침해하지 않을 것
                - 서비스의 정상적인 운영을 방해하지 않을 것
                - 불법적인 목적으로 서비스를 이용하지 않을 것
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. 서비스 중단</h2>
              <p>
                당사는 시스템 점검, 보수, 교체 등의 이유로 서비스를 일시적으로 중단할 수 있습니다.
                서비스 중단 시 사전 공지하되, 긴급한 경우 사후 공지할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. 면책조항</h2>
              <p>
                당사는 서비스 이용으로 인한 직접적, 간접적 손해에 대해 책임을 지지 않습니다.
                사용자가 서비스를 이용하여 얻은 정보에 대한 판단과 책임은 사용자에게 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. 약관 변경</h2>
              <p>
                본 약관은 필요에 따라 변경될 수 있으며, 변경된 약관은 웹사이트에 공지됩니다.
                변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 