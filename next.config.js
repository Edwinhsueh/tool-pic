/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    // 在生产构建时忽略TypeScript错误
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig 