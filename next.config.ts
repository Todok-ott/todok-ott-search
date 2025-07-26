import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 빌드 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  
  // 이미지 도메인 설정
  images: {
    domains: ['image.tmdb.org', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  
  // 빌드 설정
  output: 'standalone',
  
  // 타입스크립트 설정
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // 정적 파일 최적화
  compress: true,
  
  // 개발 서버 설정
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  }
};

export default nextConfig;
