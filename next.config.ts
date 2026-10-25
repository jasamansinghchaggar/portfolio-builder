import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Profile images and resume PDFs are capped at 5 MB, with room for
      // multipart form overhead.
      bodySizeLimit: "6mb",
    },
  },
}

export default nextConfig
