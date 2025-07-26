'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message
        });
        // 폼 초기화
        setFormData({
          name: '',
          email: '',
          type: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || '문의 접수 중 오류가 발생했습니다.'
        });
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

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
            <span className="text-[#FFD700]">문의하기</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 연락처 정보 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">연락처 정보</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-[#FFD700]" />
                  <div>
                    <p className="text-white font-medium">이메일</p>
                    <p className="text-gray-300">contact@todok.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <MessageSquare className="w-6 h-6 text-[#FFD700]" />
                  <div>
                    <p className="text-white font-medium">카카오톡</p>
                    <p className="text-gray-300">@todok</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-[#FFD700]" />
                  <div>
                    <p className="text-white font-medium">전화</p>
                    <p className="text-gray-300">02-1234-5678</p>
                  </div>
                </div>
              </div>

              {/* 관리자 링크 */}
              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-500 text-sm font-medium mb-2">관리자 전용</p>
                <a 
                  href="/admin/inquiries?adminKey=todok2024" 
                  className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                >
                  문의 관리 페이지 →
                </a>
              </div>
            </motion.div>

            {/* 문의 양식 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">문의 양식</h2>
              
              {/* 상태 메시지 */}
              {submitStatus.type && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-center space-x-2 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm">{submitStatus.message}</span>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700] transition-colors"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700] transition-colors"
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    문의 유형 *
                  </label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                  >
                    <option value="">선택하세요</option>
                    <option value="bug">버그 신고</option>
                    <option value="feature">기능 제안</option>
                    <option value="content">콘텐츠 문의</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    문의 내용 *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700] transition-colors resize-none"
                    placeholder="문의 내용을 입력하세요"
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    loading 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FFD700] text-black hover:bg-[#FFA500]'
                  }`}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? '처리 중...' : '문의하기'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 