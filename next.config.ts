import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // Cloudinary — imagens de produtos
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Supabase Storage — alternativa para imagens
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;