/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: "https://object-x.com.cn",
  images: {
    domains: [
      "images.unsplash.com",
      "iad.microlink.io",
      "avatars.githubusercontent.com",
      "next-blog.oss-cn-beijing.aliyuncs.com",
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
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
    responseLimit: "1mb",
  },
};

module.exports = nextConfig;
