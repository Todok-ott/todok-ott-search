'use client';

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat: 'auto' | 'rectangle' | 'banner' | 'leaderboard';
  className?: string;
}

export default function GoogleAdSense({ adSlot, adFormat, className = '' }: GoogleAdSenseProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // AdSense 스크립트가 로드되었는지 확인
        if ((window as unknown as { adsbygoogle?: { push: (config: unknown) => void } }).adsbygoogle) {
          (window as unknown as { adsbygoogle: { push: (config: unknown) => void } }).adsbygoogle.push({});
        } else {
          console.log('AdSense not loaded, using placeholder');
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adSlot]);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      {/* 광고 로드 실패 시 플레이스홀더 */}
      <div className="ad-placeholder bg-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
        광고 영역
      </div>
    </div>
  );
} 