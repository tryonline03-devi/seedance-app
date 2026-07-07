/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.redpandaai.co' },
      { protocol: 'https', hostname: '**.kie.ai' }
    ]
  }
};

export default nextConfig;
