/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'backend-production-f4fe.up.railway.app'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['backend-production-f4fe.up.railway.app', 'localhost:3000']
    }
  }
}

module.exports = nextConfig
