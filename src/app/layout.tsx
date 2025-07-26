import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '토독 (Todok) - OTT 검색 서비스',
  description: '찾고, 발견하고, 즐기세요. 원하는 콘텐츠를 어디서 볼 수 있는지 한눈에 확인하세요',
  keywords: '토독, Todok, OTT, 스트리밍, 영화, 드라마, 넷플릭스, 디즈니플러스, 웨이브, 티빙',
  authors: [{ name: '토독 (Todok) Team' }],
  openGraph: {
    title: '토독 (Todok) - OTT 검색 서비스',
    description: '찾고, 발견하고, 즐기세요. 원하는 콘텐츠를 어디서 볼 수 있는지 한눈에 확인하세요',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '토독 (Todok) - OTT 검색 서비스',
    description: '찾고, 발견하고, 즐기세요. 원하는 콘텐츠를 어디서 볼 수 있는지 한눈에 확인하세요',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
        
        {/* 광고 차단 감지 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 클라이언트 사이드에서만 실행
                if (typeof window !== 'undefined' && document && document.body) {
                  var testAd = document.createElement('div');
                  testAd.innerHTML = '&nbsp;';
                  testAd.className = 'adsbox';
                  document.body.appendChild(testAd);
                  
                  setTimeout(function() {
                    if (testAd.offsetHeight === 0) {
                      // 광고 차단 감지
                      console.log('Ad blocker detected');
                      // 광고 차단 메시지 표시 로직
                    }
                    if (document.body && testAd.parentNode) {
                      document.body.removeChild(testAd);
                    }
                  }, 100);
                }
              })();
            `
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
