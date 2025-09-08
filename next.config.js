/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'images.unsplash.com', 'danncelink.vercel.app'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['danncelink.vercel.app', 'localhost:3000']
    }
  },
  // Vercel-specific optimizations
  poweredByHeader: false,
  compress: true,
  swcMinify: true
}

module.exports = nextConfig
