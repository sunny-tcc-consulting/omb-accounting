import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Enable experimental features for better performance
  experimental: {
    // Optimize bundle size
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "sonner", "zod"],
    // Allow better-sqlite3 in client components
    serverComponentsExternalPackages: ["better-sqlite3"],
  },

  // Image optimization configuration
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle analysis for optimization (commented out due to Next.js 16 incompatibility)
  // webpack: (config, { dev, isServer }) => {
  //   if (!dev && !isServer) {
  //     // Add bundle analyzer plugin for production builds
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: "static",
  //         openAnalyzer: false,
  //         generateStatsFile: true,
  //         statsOptions: { source: false },
  //       })
  //     );
  //   }
  //   return config;
  // },

  // Enable compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
