import type { NextConfig } from "next";
import pkg from "./package.json";

// URL publique de l'API Symfony (ex. https://api.academie-esic.fr) — inlinée au build
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Version du site (package.json), affichée dans le pied de page ; mise à jour à chaque release / hotfix
  env: {
    APP_VERSION: pkg.version,
  },
  async redirects() {
    return [
      // Événements temporairement retirés du site (le backend et les données sont conservés)
      { source: '/evenements/:path*', destination: '/formations', permanent: false },
      // Le back-office EasyAdmin est servi par Symfony
      {
        source: '/admin/:path*',
        destination: `${BACKEND_URL}/admin/:path*`,
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
