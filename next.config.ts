import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 도메인 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
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
  }
};

export default nextConfig;
