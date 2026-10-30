import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 서비스 이미지(최대 10장 × 5MB)를 Server Action으로 받는다
  experimental: { serverActions: { bodySizeLimit: '60mb' } },
};

export default nextConfig;
