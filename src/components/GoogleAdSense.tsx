'use client';

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'leaderboard';
  className?: string;
}

export default function GoogleAdSense({ adSlot, adFormat = 'auto', className = '' }: GoogleAdSenseProps) {
  useEffect(() => {
    // AdSense 스크립트가 로드되었는지 확인
    if (typeof window !== 'undefined' && (window as unknown as { adsbygoogle?: { push: (config: unknown) => void } }).adsbygoogle) {
      try {
        (window as unknown as { adsbygoogle: { push: (config: unknown) => void } }).adsbygoogle.push({});
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
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 실제 AdSense 클라이언트 ID로 교체
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
} 