import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
      <body className={inter.className}>
        {children}
        {/* Google AdSense - 조건부 로드 */}
        {process.env.NODE_ENV === 'production' && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
            crossOrigin="anonymous"
          />
        )}
        {/* GoogleAnalytics는 조건부로 로드 */}
        {process.env.NODE_ENV === 'production' && <GoogleAnalytics />}
      </body>
    </html>
  );
}
