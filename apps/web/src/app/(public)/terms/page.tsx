'use client';

import React from 'react';
import { Container, Badge } from '@legalhub/ui';
import { Scale, AlertCircle } from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import { usePlatformSettings } from '../../../lib/hooks/use-platform-settings';

export default function TermsOfServicePage() {
  const { unlockFee } = usePlatformSettings();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              <Scale className="h-3.5 w-3.5 mr-1" />
              Legal & Compliance Terms
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-500">
              Effective Date: September 12, 2026 | Last Updated: September 20, 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Terms Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl prose prose-slate text-sm sm:text-base leading-relaxed space-y-8">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Important Notice:</strong> ZipAdvo is a technology facilitation platform and is not a law firm.
                  We do not solicit legal work or provide legal advice directly.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p className="text-slate-600">
                By accessing, browsing, or utilizing the services provided by ZipAdvo (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
                you (&quot;User&quot;, &quot;Client&quot;, or &quot;Advocate&quot;) agree to be bound by these Terms of Service. If you do not agree
                to these terms, please do not use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">2. Nature of Platform & Intermediary Status</h2>
              <p className="text-slate-600">
                ZipAdvo operates as an intermediary under Section 79 of the Information Technology Act, 2000.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>The Platform does not provide legal advice, draft legal opinions directly, or represent any party in court or before registration authorities.</li>
                <li>No attorney-client relationship is created between ZipAdvo and any user. The attorney-client relationship exists solely between the Client and the independent Advocate chosen by the Client.</li>
                <li>Information provided on advocate profile pages (such as years of experience, Sanad verification status, and practice areas) is provided for factual informational purposes to assist users in making informed choices.</li>
              </ul>
            </section>

            <section className="space-y-3" suppressHydrationWarning>
              <h2 className="font-serif text-xl font-bold text-slate-900" suppressHydrationWarning>3. Facilitation Fee (₹{unlockFee})</h2>
              <p className="text-slate-600" suppressHydrationWarning>
                To initiate a booking and unlock direct communication and encrypted document sharing with a verified advocate, Clients pay a one-time platform facilitation fee of ₹{unlockFee} (inclusive of applicable GST).
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li suppressHydrationWarning>The ₹{unlockFee} fee is solely for platform infrastructure, identity verification, and document vault hosting.</li>
                <li suppressHydrationWarning>The ₹{unlockFee} fee is NOT a legal consultation or retainership fee. Any professional fees for legal title verification, agreement drafting, or sub-registrar representation are settled directly between the Client and the Advocate.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">4. Advocate Eligibility & Sanad Verification</h2>
              <p className="text-slate-600">
                To be listed as a verified advocate on ZipAdvo:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>Advocates must hold an active enrollment (Sanad) with the Bar Council of Maharashtra & Goa (BCMG) or another recognized State Bar Council.</li>
                <li>Advocates must maintain high ethical standards in accordance with the Advocates Act, 1961.</li>
                <li>Advocates agree to respond to unlocked client inquiries within twenty-four (24) business hours.</li>
                <li>The Platform reserves the right to suspend or remove any advocate profile upon receiving verified complaints of professional misconduct or invalid enrollment.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">5. Client Responsibilities & Document Uploads</h2>
              <p className="text-slate-600">
                Clients agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>Provide accurate, genuine, and unmanipulated property documents (7/12 extracts, Index II records, sale deeds).</li>
                <li>Refrain from uploading unlawful, infringing, or malicious content to the document vault.</li>
                <li>Respect the professional time and scheduling of the assigned advocate.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">6. Limitation of Liability</h2>
              <p className="text-slate-600">
                To the fullest extent permitted by Indian law, ZipAdvo shall not be liable for any indirect, incidental, special, or consequential damages resulting from legal advice rendered by independent advocates, disputes arising between clients and advocates, or delays at government Sub-Registrar Offices.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">7. Governing Law & Jurisdiction</h2>
              <p className="text-slate-600">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or proceeding arising out of or related to the Platform shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">8. Contact & Redressal</h2>
              <p className="text-slate-600">
                For questions or formal notices regarding these terms, please contact:
              </p>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs sm:text-sm space-y-1 text-slate-700">
                <p><strong>Legal & Compliance Desk:</strong> zipadvo@gmail.com</p>
                <p><strong>Registered Address:</strong> Nandanvan appartment, bus stop, 13, Kalyan-Murbad Rd, near prem auto, Purnima, Kalyan, Maharashtra 421301</p>
              </div>
            </section>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
