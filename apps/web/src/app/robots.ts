import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zipadvo-web.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/find-lawyer',
          '/how-it-works',
          '/for-lawyers',
          '/about',
          '/contact',
          '/privacy',
          '/terms',
          '/refund-policy',
        ],
        disallow: [
          '/dashboard/',
          '/lawyer/',
          '/admin/',
          '/api/',
          '/verify/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
