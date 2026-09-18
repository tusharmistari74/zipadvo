import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '../lib/auth/context';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegalHubMumbai | Verified Property & Document Registration Lawyers',
  description: 'Connect with verified property & conveyancing lawyers in Mumbai.',
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
        {/* Google reCAPTCHA Enterprise Script */}
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_KEY}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
