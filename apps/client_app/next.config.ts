import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({
  path: resolve(__dirname, '../../.env'),
});

const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
};

export default nextConfig;
