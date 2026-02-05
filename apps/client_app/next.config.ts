import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({
  path: resolve(__dirname, '../../.env'),
});

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: '/api/auth/:path*',
        destination: isDev
          ? 'http://localhost:3002/:path*'
          : 'http://16.16.94.166:3002/:path*',
      },
      {
        source: '/api/core/:path*',
        destination: isDev
          ? 'http://localhost:3001/:path*'
          : 'http://16.16.94.166:3001/:path*',
      },
      {
        source: '/api/notifications/:path*',
        destination: isDev
          ? 'http://localhost:3003/:path*'
          : 'http://16.16.94.166:3003/:path*',
      },
    ];
  },

  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
};

export default nextConfig;
