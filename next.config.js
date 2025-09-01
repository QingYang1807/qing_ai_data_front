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
  // 重写配置 - 通过网关统一代理
  async rewrites() {
    return [
      // Nacos服务发现API代理
      {
        source: '/nacos/:path*',
        destination: 'http://127.0.0.1:8848/nacos/:path*',
      },
      // 所有API请求通过网关
      {
        source: '/api/:path*',
        destination: 'http://localhost:9114/api/:path*',
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
      // CORS 配置
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 