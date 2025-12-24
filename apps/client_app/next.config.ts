import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import type { NextConfig } from 'next';

// ⬇️ ŁADUJE .env Z ROOTA MONOREPO
loadEnv({
  path: resolve(__dirname, '../../.env'),
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ⬇️ WSTRZYKUJEMY ZMIENNĄ DO FRONTENDU
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
};

export default nextConfig;
