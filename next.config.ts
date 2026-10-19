import type { NextConfig } from 'next';

const supabaseStoragePattern = (() => {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) return [];

  try {
    const storageUrl = new URL(configuredUrl);
    if (storageUrl.protocol !== 'https:' && storageUrl.protocol !== 'http:') {
      return [];
    }

    return [
      {
        protocol: storageUrl.protocol.slice(0, -1) as 'https' | 'http',
        hostname: storageUrl.hostname,
        port: storageUrl.port,
        pathname: '/storage/v1/**',
      },
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: supabaseStoragePattern,
  },
};

export default nextConfig;
