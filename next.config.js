/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "iad.microlink.io",
      "avatars.githubusercontent.com",
      "next-blog.oss-cn-beijing.aliyuncs.com",
      "object-x.com.cn",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.aliyuncs.com",
      },
    ],
  },
  transpilePackages: ['antd', '@ant-design/icons'],
  compiler: {
    // 生产环境移除 console
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],  // 保留 console.error
    } : false,
  },
  async headers() {
    return [
      {
        // 为所有路由添加安全头
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ]
      },
      {
        // 为 API 路由添加 CORS 配置
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || '*' // 生产环境应该设置具体域名
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
