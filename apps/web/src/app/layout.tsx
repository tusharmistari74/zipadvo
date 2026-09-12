import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegalHubMumbai | Verified Property & Document Registration Lawyers',
  description: 'Connect with verified property & conveyancing lawyers in Mumbai.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
