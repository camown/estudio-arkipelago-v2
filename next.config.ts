import type { NextConfig } from "next";

const isStaticExport = process.env.TAURI_BUILD === 'true' || process.env.GITHUB_PAGES === 'true' || process.env.NEXT_EXPORT === 'true';
const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isStaticExport ? { output: 'export' } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
