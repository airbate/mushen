/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['lunar-typescript', 'iztro'],
};

export default nextConfig;