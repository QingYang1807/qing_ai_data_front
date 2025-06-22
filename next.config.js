/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 在生产构建过程中忽略TypeScript错误
    ignoreBuildErrors: false,
  },
  eslint: {
    // 在生产构建过程中忽略ESLint错误
    ignoreDuringBuilds: false,
  },
  output: 'standalone',
  // 图片优化配置
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  // 环境变量配置
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // 重写配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  // 响应头配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 