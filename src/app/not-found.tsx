'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-400 mb-8">요청하신 페이지가 존재하지 않습니다.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-yellow-500 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-400 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
} 