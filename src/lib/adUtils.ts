// 광고 관리 유틸리티

export interface AdConfig {
  id: string;
  type: 'adsense' | 'amazon';
  position: 'header' | 'content' | 'sidebar';
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'leaderboard';
  productData?: {
    title: string;
    image: string;
    price: string;
    url: string;
  };
}

// 광고 설정 (실제 AdSense/Amazon 키로 교체 필요)
const adConfigs: AdConfig[] = [
  {
    id: 'header-adsense',
    type: 'adsense',
    position: 'header',
    adSlot: '1234567890',
    adFormat: 'banner'
  },
  {
    id: 'content-amazon-1',
    type: 'amazon',
    position: 'content',
    productData: {
      title: '4K 스마트 TV',
      image: '/placeholder-product.jpg',
      price: '₩599,000',
      url: 'https://amazon.com/dp/example'
    }
  },
  {
    id: 'content-amazon-2',
    type: 'amazon',
    position: 'content',
    productData: {
      title: '홈시어터 시스템',
      image: '/placeholder-product.jpg',
      price: '₩299,000',
      url: 'https://amazon.com/dp/example'
    }
  }
];

export const getAdsByPosition = (position: 'header' | 'content' | 'sidebar'): AdConfig[] => {
  return adConfigs.filter(ad => ad.position === position);
};

export const trackAdRevenue = (adId: string, revenue: number) => {
  // Google Analytics 추적
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (command: string, targetId: string, config: unknown) => void }).gtag) {
    (window as unknown as { gtag: (command: string, targetId: string, config: unknown) => void }).gtag('event', 'ad_revenue', {
      ad_id: adId,
      revenue: revenue,
      currency: 'KRW'
    });
  }
}; 