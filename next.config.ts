import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stray package.json in the parent githubDir makes Turbopack infer the
  // wrong workspace root, breaking module resolution (e.g. tailwindcss).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
