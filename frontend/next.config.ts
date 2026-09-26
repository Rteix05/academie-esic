import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: `${BACKEND_URL}/admin`,
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: `${BACKEND_URL}/admin/:path*`,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;