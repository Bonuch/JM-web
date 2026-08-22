import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Картинки лежат в Vercel Blob; поддомен зависит от стора, поэтому шаблон
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Рендеры интерьеров живут долго и не меняются — кэшируем агрессивно
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // 95 — для крупных планов, 90 — для карточек в сетке
    qualities: [90, 95],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
