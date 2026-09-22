'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@legalhub/ui';
import {
  Search,
  FileCheck,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Key,
} from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';
import { usePlatformSettings } from '../../../lib/hooks/use-platform-settings';

export default function HowItWorksPage() {
  const { unlockFee } = usePlatformSettings();

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Search & Select Verified Advocate',
      description:
        'Filter by Mumbai micro-market (South Mumbai, Bandra, Andheri, Thane, Navi Mumbai) and exact service requirement (Title Search, RERA Due Diligence, Leave & License, Sale Deed).',
      features: [
        'Bar Council Sanad & verification status displayed',
        'Transparent fee estimates & verified experience',
        'Chamber location and Mumbai court jurisdiction clarity',
      ],
    },
    {
      number: '02',
      icon: Key,
      title: `Direct Advocate Unlock (₹${unlockFee} Facilitation)`,
      description:
        `Pay a nominal ₹${unlockFee} platform facilitation fee to unlock the advocate’s direct mobile number, chamber address, email, and instant scheduling calendar.`,
      features: [
        'Instant phone number & direct WhatsApp access',
        'Direct calendar booking without broker markups',
        'Zero commission taken on advocate legal fees',
      ],
    },
    {
      number: '03',
      icon: Lock,
      title: 'Encrypted Document Sharing (Optional)',
      description:
        'Upload sensitive title deeds, 7/12 extracts, Index II, and search reports directly to your AES-256 encrypted confidential vault.',
      features: [
        'Client-side Aadhaar/PAN masking compliance',
        'Time-limited access tokens for authorized advocates only',
        'Permanent client data sovereignty (DPDP Act compliant)',
      ],
    },
    {
      number: '04',
      icon: FileCheck,
      title: 'Consultation & Conveyance Execution',
      description:
        'Meet the advocate in their Mumbai chamber or connect via video. Receive a stamped Title Verification Report or complete deed registration at the Sub-Registrar Office.',
      features: [
        '48-hour SLA for preliminary title verification opinions',
        'In-person representation at SRO / MahaRERA / High Court',
        'Direct client-advocate billing with no platform cuts',
      ],
    },
  ];

  const comparisons = [
    {
      factor: 'Advocate Verification',
      traditional: 'Unverified referrals, uncredentialed touts outside registrar offices',
      legalHub: '100% Sanad verified via Bar Council of Maharashtra & Goa records',
    },
    {
      factor: 'Pricing & Fees',
      traditional: 'Hidden commissions, arbitrary broker markups, unpredictable quotes',
      legalHub: `₹${unlockFee} transparent facilitation unlock fee, direct client-advocate fee agreement`,
    },
    {
      factor: 'Document Security',
      traditional: 'Photocopies left with unvetted third parties without audit trails',
      legalHub: 'Encrypted digital vault with auto-masking and revocable permissions',
    },
    {
      factor: 'Geographical Reach',
      traditional: 'Limited to immediate neighborhood or builder-sponsored lawyers',
      legalHub: 'All 36 Sub-Registrar jurisdictions across Mumbai City, Suburban & MMR',
    },
    {
      factor: 'Ethics & Compliance',
      traditional: 'Vulnerable to conflicts of interest with builders or brokers',
      legalHub: 'Independent legal counsel representing solely your buyer/client interests',
    },
  ];

  const faqs = [
    {
      q: `What exactly does the ₹${unlockFee} unlock fee cover?`,
      a: `The ₹${unlockFee} fee is an intermediary platform facilitation fee that covers identity verification, platform maintenance, encrypted document vault hosting, and direct contact unlocking. It is NOT legal advisory fees; legal consultation fees are agreed upon directly between you and your chosen advocate.`,
    },
    {
      q: 'Are the lawyers on ZipAdvo employees of the platform?',
      a: 'No. ZipAdvo is a technology intermediary platform. All listed advocates are independent legal practitioners enrolled with the Bar Council of Maharashtra & Goa. In accordance with Bar Council of India rules, the platform does not solicit work or advertise on behalf of advocates.',
    },
    {
      q: 'What if the lawyer I unlocked does not respond?',
      a: 'We enforce strict service level standards. If a verified advocate does not respond to your consultation request within 24 business hours, our support team will either re-assign your unlock token to another top advocate or issue an immediate, no-questions-asked refund.',
    },
    {
      q: 'Is my property documentation kept confidential?',
      a: 'Absolutely. Documents uploaded to ZipAdvo are encrypted at rest (AES-256) and in transit (TLS 1.3). Only you and the specific advocate you explicitly authorize can access your documents. We do not sell or share data with builders, banks, or marketing entities.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Transparent & BCI-Compliant Process
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              How ZipAdvo Works
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              We eliminate broker markups and unverified touts by giving you direct, secure access to
              Bar Council-verified property lawyers across Mumbai in four straightforward steps.
            </p>
          </div>
        </Container>
      </section>

      {/* 4 Steps Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-serif font-bold text-lg">
                        {step.number}
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 pt-3">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-slate-100">
                      {step.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Platform Comparison */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12 space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Why Direct Facilitation Beats Traditional Routes
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A clear comparison between unvetted broker arrangements and ZipAdvo’s verified network.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-900 font-semibold">
                <tr>
                  <th className="p-4 sm:px-6">Feature</th>
                  <th className="p-4 sm:px-6 text-slate-500">Traditional / Broker Route</th>
                  <th className="p-4 sm:px-6 text-blue-800 bg-blue-50/50">ZipAdvo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {comparisons.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 sm:px-6 font-medium text-slate-900">{row.factor}</td>
                    <td className="p-4 sm:px-6 text-slate-500">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 bg-blue-50/20 font-medium text-slate-900">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.legalHub}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Security & Document Handling */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <Badge variant="outline" className="bg-slate-800 text-blue-300 border-slate-700">
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Banking-Grade Infrastructure
                </Badge>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Your Property Documents Are Never Shared or Sold
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Real estate titles contain sensitive personal information. We employ client-side masking,
                  strict Firestore security rules, and granular advocate permissions to guarantee strict privacy.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs sm:text-sm text-slate-300">256-Bit Encrypted Vault</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs sm:text-sm text-slate-300">Automatic Aadhaar Masking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs sm:text-sm text-slate-300">Zero Unvetted Third Parties</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs sm:text-sm text-slate-300">Instant Access Revocation</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center space-y-4">
                <Users className="h-12 w-12 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Ready to consult an expert?</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Browse verified lawyers across Mumbai and initiate your title check or deed drafting today.
                </p>
                <Link href="/find-lawyer" className="w-full">
                  <Button variant="primary" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Find a Verified Lawyer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-slate-200 bg-slate-50/50 py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Common Questions on Platform Facilitation
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-6 space-y-2">
                    <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
