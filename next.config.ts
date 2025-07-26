import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 도메인 설정
  images: {
    domains: ['image.tmdb.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      }
    ]
  },
  
  // 타입스크립트 설정
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Vercel 배포 최적화
  output: 'standalone'
};

export default nextConfig;
