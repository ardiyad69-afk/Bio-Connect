import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // @node-rs/argon2 ships a native .node binary that webpack can't bundle;
  // postgres is externalized too so it stays a single module instance
  // (single connection pool per instance) whether it's reached directly by
  // apps/web or transitively through @repo/api's mounted route handler.
  serverExternalPackages: ["@node-rs/argon2", "postgres"],
};

export default nextConfig;
