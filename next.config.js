/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Static export for Netlify
  output: 'export',
  trailingSlash: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Image optimization (unoptimized for static export)
  images: {
    unoptimized: true,
    domains: ['api.intuitv.app', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
