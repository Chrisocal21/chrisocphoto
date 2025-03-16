/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://chrisocphoto.vercel.app' 
    : undefined,
  env: {
    SITE_URL: process.env.NODE_ENV === 'production'
      ? 'https://chrisocphoto.vercel.app'
      : 'http://localhost:3000'
  }
};

module.exports = nextConfig;
