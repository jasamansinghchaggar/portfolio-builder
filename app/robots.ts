import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/editor",
          "/settings",
          "/admin",
          "/onboarding",
          "/preview",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/auth",
          "/media",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
