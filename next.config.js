/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    css: {
      // Desabilita o lightningcss
      lightningcss: false
    }
  }
};

module.exports = nextConfig;
