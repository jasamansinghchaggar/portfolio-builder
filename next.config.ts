import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.29.87"],
  experimental: {
    // Opt in to the security-upgrade nudge channel; set by the agent-driven
    // security upgrade from 16.4.2 to 16.4.6.
    agentUpgrade: "security",
    serverActions: {
      // Profile images and resume PDFs are capped at 5 MB, with room for
      // multipart form overhead.
      bodySizeLimit: "6mb",
    },
  },
}

export default nextConfig
