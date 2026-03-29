import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost', '192.168.1.10'],
  reactCompiler: true,
};

export default nextConfig;
