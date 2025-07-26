'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">오류가 발생했습니다</h1>
        <p className="text-gray-400 mb-8">예상치 못한 오류가 발생했습니다.</p>
        <button
          onClick={() => reset()}
          className="bg-yellow-500 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-400 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
} 