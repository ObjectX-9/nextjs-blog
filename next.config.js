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
    ],
  },
};

module.exports = nextConfig;
