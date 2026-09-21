import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { AuthProvider } from '../lib/auth/context';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'ZipAdvo | Verified Property & Legal Registration Advocates Network',
  description: 'Connect with Bar Council verified property & conveyancing advocates in Mumbai for title search, deed registration, and legal consultations.',
};

const RECAPTCHA_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LchH8ItAAAAACBC4N86SPJ18C_0XM5FNTSK0sDv';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        {/* Google reCAPTCHA Enterprise Script - lazyOnload prevents body hydration collisions */}
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_KEY}`}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
