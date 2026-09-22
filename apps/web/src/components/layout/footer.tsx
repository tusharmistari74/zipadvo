'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@legalhub/ui';
import { Scale, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { usePlatformSettings } from '../../lib/hooks/use-platform-settings';

export function Footer() {
  const { unlockFee, supportEmail, supportPhone } = usePlatformSettings();
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Scale className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Zip<span className="text-blue-400">Advo</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Mumbai&apos;s verified legal advocate marketplace connecting property buyers, conveyance clients, and redevelopment societies with Bar Council accredited advocates.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Nandanvan appartment, bus stop, 13, Kalyan-Murbad Rd, near prem auto, Purnima, Kalyan, Maharashtra 421301</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <a href={`mailto:${supportEmail}`} suppressHydrationWarning className="hover:text-white transition-colors underline decoration-blue-500/50">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} suppressHydrationWarning className="hover:text-white transition-colors font-semibold text-emerald-300">
                  {supportPhone} (Helpline & WhatsApp)
                </a>
              </div>
            </div>
          </div>

          {/* Legal Services */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Property Services</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/find-lawyer?category=registration" className="hover:text-white transition-colors">
                  Property Registration
                </Link>
              </li>
              <li>
                <Link href="/find-lawyer?category=title" className="hover:text-white transition-colors">
                  Title Search & 7/12
                </Link>
              </li>
              <li>
                <Link href="/find-lawyer?category=rera" className="hover:text-white transition-colors">
                  MahaRERA Disputes
                </Link>
              </li>
              <li>
                <Link href="/find-lawyer?category=society" className="hover:text-white transition-colors">
                  Society Redevelopment
                </Link>
              </li>
              <li>
                <Link href="/find-lawyer?category=deed" className="hover:text-white transition-colors">
                  Sale & Gift Deed Drafting
                </Link>
              </li>
            </ul>
          </div>

          {/* Mumbai Courts Covered */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Court Coverage</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Bombay High Court</li>
              <li>City Civil Court (Fort)</li>
              <li>Dindoshi Court (Goregaon)</li>
              <li>Bandra Metropolitan Court</li>
              <li>MahaRERA Tribunal (BKC)</li>
              <li>Thane District Court</li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Platform & Legal</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/for-lawyers" className="hover:text-white transition-colors">
                  Advocate Onboarding (KYC)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="mt-12 border-t border-slate-800 pt-8 space-y-4">
          <div className="flex items-start gap-2.5 rounded-lg bg-slate-950 p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed" suppressHydrationWarning>
            <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div suppressHydrationWarning>
              <span className="font-semibold text-slate-300">Bar Council of India Disclaimer: </span>
              ZipAdvo is a technology intermediary platform and is not a law firm. As per the rules of the Bar Council of India, advocates are not permitted to solicit work or advertise. The platform facilitates discovery and appointment booking at the client&apos;s sole initiative. The ₹{unlockFee} unlock fee is a technology facilitation fee for platform operations.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p suppressHydrationWarning>© {new Date().getFullYear()} ZipAdvo Technologies Pvt. Ltd. All rights reserved.</p>
            <p suppressHydrationWarning>24/7 Support: {supportEmail} • Helpline: {supportPhone}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
