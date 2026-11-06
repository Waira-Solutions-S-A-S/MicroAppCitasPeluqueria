import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic auth + database reads everywhere: no route-level prerender cache.
  cacheComponents: false,
  serverExternalPackages: ["@prisma/client"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
