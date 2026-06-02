import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
      "connect-src 'self' https://viacep.com.br https://*.supabase.co https://api.mercadopago.com https://*.mercadopago.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.analytics.google.com https://stats.g.doubleclick.net https://connect.facebook.net https://*.facebook.com https://melhorenvio.com.br https://www.melhorenvio.com.br https://*.ingest.sentry.io",
      // MP usa iframe para o checkout do PIX
      "frame-src 'self' https://*.mercadopago.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

// Cache headers para rotas públicas da API — servidas pelo CDN da Vercel
const apiCacheHeaders = [
  { key: "Cache-Control", value: "s-maxage=60, stale-while-revalidate=120" },
]
const categoriaCacheHeaders = [
  { key: "Cache-Control", value: "s-maxage=300, stale-while-revalidate=600" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/produtos", headers: apiCacheHeaders },
      { source: "/api/banners",  headers: apiCacheHeaders },
      { source: "/api/categorias", headers: categoriaCacheHeaders },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "metalab-02",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
