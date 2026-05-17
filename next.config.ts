import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",        value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // GA4 (gtag), Meta Pixel (fbq), MercadoPago SDK
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://sdk.mercadopago.com https://*.mercadopago.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // imagens: Cloudinary, Supabase, GA pixels, FB pixel
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.facebook.com https://*.facebook.net https://*.mercadopago.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      // beacons: GA, FB, MP, ViaCEP, Melhor Envio, Supabase
      "connect-src 'self' https://viacep.com.br https://*.supabase.co https://api.mercadopago.com https://*.mercadopago.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.analytics.google.com https://stats.g.doubleclick.net https://connect.facebook.net https://*.facebook.com https://melhorenvio.com.br https://www.melhorenvio.com.br",
      // MP usa iframe para o checkout do PIX
      "frame-src 'self' https://*.mercadopago.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;