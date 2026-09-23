/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@legalhub/ui',
    '@legalhub/utils',
    '@legalhub/config',
    '@legalhub/validation',
    '@legalhub/types',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://apis.google.com https://www.google.com https://www.gstatic.com https://recaptcha.google.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com",
              "img-src 'self' blob: data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://*.google.com https://*.gstatic.com https://*.googleapis.com https://maps.gstatic.com https://maps.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://*.googleapis.com https://maps.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://api.razorpay.com https://lumberjack.razorpay.com https://www.google.com https://recaptcha.google.com wss://*.firebaseio.com",
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://recaptcha.google.com https://*.firebaseapp.com https://maps.google.com https://*.google.com https://www.google.com/maps",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "block-all-mixed-content",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
