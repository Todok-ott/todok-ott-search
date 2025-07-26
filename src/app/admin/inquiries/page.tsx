'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Mail, Calendar, User, MessageSquare } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'read' | 'replied';
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminKey = searchParams.get('adminKey');
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await fetch(`/api/contact?adminKey=${adminKey}`);
        const data = await response.json();

        if (response.ok) {
          setInquiries(data.inquiries);
        } else {
          setError(data.error || '문의 목록을 불러올 수 없습니다.');
        }
      } catch (error) {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (adminKey) {
      fetchInquiries();
    } else {
      setError('관리자 권한이 필요합니다.');
      setLoading(false);
    }
  }, [adminKey]);

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      bug: '버그 신고',
      feature: '기능 제안',
      content: '콘텐츠 문의',
      other: '기타'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      read: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      replied: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: '대기중',
      read: '확인됨',
      replied: '답변완료'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

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
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-gray-600/20"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-[#FFD700]">문의 관리</span>
            </h1>
            <div className="text-gray-400">
              총 {inquiries.length}개의 문의
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">아직 접수된 문의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-black/20 border border-gray-600/20 rounded-lg p-6 hover:border-gray-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-[#FFD700]" />
                        <span className="text-white font-medium">{inquiry.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300 text-sm">{inquiry.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(inquiry.status)}`}>
                        {getStatusLabel(inquiry.status)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {getTypeLabel(inquiry.type)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 leading-relaxed">{inquiry.message}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(inquiry.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-[#FFD700] hover:text-[#FFA500] transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                        <span>상세보기</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 