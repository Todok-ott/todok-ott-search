// 광고 관리 유틸리티

export interface AdConfig {
  id: string;
  type: 'adsense' | 'amazon';
  position: 'header' | 'sidebar' | 'content' | 'footer';
  enabled: boolean;
  familyFriendly: boolean;
  adSlot?: string;
  adFormat?: string;
  productData?: {
    title: string;
    image: string;
    price: string;
    url: string;
  };
}

// 광고 설정
export const adConfigs: AdConfig[] = [
  {
    id: 'header-banner',
    type: 'adsense',
    position: 'header',
    enabled: true,
    familyFriendly: true,
    adSlot: '1234567890',
    adFormat: 'banner'
  },
  {
    id: 'sidebar-rectangle',
    type: 'adsense',
    position: 'sidebar',
    enabled: true,
    familyFriendly: true,
    adSlot: '0987654321',
    adFormat: 'rectangle'
  },
  {
    id: 'content-auto',
    type: 'adsense',
    position: 'content',
    enabled: true,
    familyFriendly: true,
    adSlot: '1122334455',
    adFormat: 'auto'
  },
  {
    id: 'amazon-product-1',
    type: 'amazon',
    position: 'content',
    enabled: true,
    familyFriendly: true,
    productData: {
      title: '4K 스마트 TV',
      image: '/products/smart-tv.jpg',
      price: '₩599,000',
      url: 'https://www.amazon.co.kr/dp/B08N5WRWNW'
    }
  },
  {
    id: 'amazon-product-2',
    type: 'amazon',
    position: 'sidebar',
    enabled: true,
    familyFriendly: true,
    productData: {
      title: '블루투스 스피커',
      image: '/products/bluetooth-speaker.jpg',
      price: '₩89,000',
      url: 'https://www.amazon.co.kr/dp/B07FZ8S74R'
    }
  }
];

// 가족 친화적 광고만 필터링
export const getFamilyFriendlyAds = (): AdConfig[] => {
  return adConfigs.filter(ad => ad.familyFriendly && ad.enabled);
};

// 위치별 광고 가져오기
export const getAdsByPosition = (position: string): AdConfig[] => {
  return getFamilyFriendlyAds().filter(ad => ad.position === position);
};

// 광고 로드 상태 관리
export const adLoadStates = {
  adsenseLoaded: false,
  amazonLoaded: false
};

// AdSense 스크립트 로드
export const loadAdSenseScript = () => {
  if (typeof window !== 'undefined' && !adLoadStates.adsenseLoaded) {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      adLoadStates.adsenseLoaded = true;
    };
    document.head.appendChild(script);
  }
};

// 광고 차단 감지
export const detectAdBlocker = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
};

// 광고 수익 추적
export const trackAdRevenue = (adId: string, revenue: number) => {
  // Google Analytics 이벤트 추적
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (command: string, targetId: string, config: unknown) => void }).gtag) {
    (window as unknown as { gtag: (command: string, targetId: string, config: unknown) => void }).gtag('event', 'ad_revenue', {
      ad_id: adId,
      revenue: revenue,
      currency: 'KRW'
    });
  }
};

// 광고 성능 모니터링
export const monitorAdPerformance = (adId: string, metric: string, value: number) => {
  console.log(`Ad Performance - ${adId}: ${metric} = ${value}`);
  
  // 성능 데이터를 서버로 전송
  fetch('/api/analytics/ad-performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adId,
      metric,
      value,
      timestamp: new Date().toISOString()
    })
  }).catch(error => {
    console.error('Ad performance tracking error:', error);
  });
}; 