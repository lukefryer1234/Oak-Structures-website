/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for self-hosted deployment
  images: {
    unoptimized: true,
  },
  // Disable external dependencies
  trailingSlash: false,
  // Disable telemetry
  telemetry: false,
};

module.exports = nextConfig;
