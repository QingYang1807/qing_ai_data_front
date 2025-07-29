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
  // 重写配置 - 代理所有后端模块API
  async rewrites() {
    return [
      // 数据集管理模块 (端口: 9101)
      {
        source: '/api/v1/datasets/:path*',
        destination: 'http://localhost:9101/api/v1/datasets/:path*',
      },
      // 数据源管理模块 (端口: 9102)
      {
        source: '/api/v1/datasources/:path*',
        destination: 'http://localhost:9102/api/v1/datasources/:path*',
      },
      // 数据采集模块 (端口: 9103)
      {
        source: '/api/v1/collect/:path*',
        destination: 'http://localhost:9103/api/v1/collect/:path*',
      },
      // 数据处理模块 (端口: 9104)
      {
        source: '/api/v1/process/:path*',
        destination: 'http://localhost:9104/api/v1/process/:path*',
      },
      // 数据标注模块 (端口: 9105)
      {
        source: '/api/v1/annotation/:path*',
        destination: 'http://localhost:9105/api/v1/annotation/:path*',
      },
      // 数据增强模块 (端口: 9106)
      {
        source: '/api/v1/augment/:path*',
        destination: 'http://localhost:9106/api/v1/augment/:path*',
      },
      // 数据合成模块 (端口: 9107)
      {
        source: '/api/v1/synthesis/:path*',
        destination: 'http://localhost:9107/api/v1/synthesis/:path*',
      },
      // 数据质量模块 (端口: 9108)
      {
        source: '/api/v1/quality/:path*',
        destination: 'http://localhost:9108/api/v1/quality/:path*',
      },
      // 数据评估模块 (端口: 9109)
      {
        source: '/api/v1/evaluation/:path*',
        destination: 'http://localhost:9109/api/v1/evaluation/:path*',
      },
      // 数据安全模块 (端口: 9110)
      {
        source: '/api/v1/security/:path*',
        destination: 'http://localhost:9110/api/v1/security/:path*',
      },
      // 数据操作模块 (端口: 9111)
      {
        source: '/api/v1/operation/:path*',
        destination: 'http://localhost:9111/api/v1/operation/:path*',
      },
      // 数据导出模块 (端口: 9112)
      {
        source: '/api/v1/export/:path*',
        destination: 'http://localhost:9112/api/v1/export/:path*',
      },
      // 系统管理模块 (端口: 9113)
      {
        source: '/api/v1/system/:path*',
        destination: 'http://localhost:9113/api/v1/system/:path*',
      },
      // 网关服务模块 (端口: 9114)
      {
        source: '/api/v1/gateway/:path*',
        destination: 'http://localhost:9114/api/v1/gateway/:path*',
      },
      // 通用API代理 (兼容旧配置)
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