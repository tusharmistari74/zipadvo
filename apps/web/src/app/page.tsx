'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Rating, Avatar } from '@legalhub/ui';
import { Navbar } from '../components/layout/navbar';
import { Footer } from '../components/layout/footer';
import { usePlatformSettings } from '../lib/hooks/use-platform-settings';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Scale,
  Lock,
  Clock,
  Search,
  ArrowRight,
  HelpCircle,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { unlockFee } = usePlatformSettings();
  const sampleLawyers = [
    {
      id: 'adv_rajesh_mehta',
      name: 'Adv. Rajesh Mehta',
      title: 'Senior Property Conveyancing & Title Advocate',
      sanad: 'MAH/4521/2012',
      court: 'Bombay High Court & Fort City Civil',
      experience: '14+ Years',
      rating: 4.9,
      reviewCount: 62,
      location: 'South Mumbai & BKC',
      specialties: ['Title Verification', 'Society Redevelopment', 'Sale Deed Drafting'],
    },
    {
      id: 'adv_priya_deshmukh',
      name: 'Adv. Priya Deshmukh',
      title: 'Advocate & MahaRERA Legal Consultant',
      sanad: 'MAH/1982/2016',
      court: 'MahaRERA Tribunal & Bandra Court',
      experience: '9+ Years',
      rating: 4.8,
      reviewCount: 47,
      location: 'Western Suburbs (Bandra / Andheri)',
      specialties: ['RERA Builder Delays', 'Index-2 Registration', 'Lease Agreements'],
    },
    {
      id: 'adv_vikram_joshi',
      name: 'Adv. Vikram Joshi',
      title: 'Property Litigation & Conveyance Specialist',
      sanad: 'MAH/3104/2014',
      court: 'Dindoshi Court & Borivali Court',
      experience: '11+ Years',
      rating: 4.9,
      reviewCount: 53,
      location: 'Western & Northern Suburbs',
      specialties: ['Deemed Conveyance', '7/12 Mutation', 'Gift & Succession Deeds'],
    },
  ];

  const services = [
    {
      icon: <Building2 className="h-6 w-6 text-blue-700" />,
      title: 'Title Verification & 30-Year Search',
      description: 'Complete due diligence of 7/12 extracts, Index-2 records, encumbrance certificates, and mutation entries before you buy.',
      tag: 'Most Popular',
    },
    {
      icon: <FileCheck2 className="h-6 w-6 text-blue-700" />,
      title: 'Property Registration & Conveyancing',
      description: 'Drafting and vetting of Sale Deeds, Agreement for Sale, Stamp Duty adjudication, and Sub-Registrar registration assistance.',
      tag: 'End-to-End',
    },
    {
      icon: <Scale className="h-6 w-6 text-blue-700" />,
      title: 'MahaRERA Advisory & Builder Disputes',
      description: 'Legal notices and representation for possession delays, carpet area discrepancies, and RERA compensation claims.',
      tag: 'Litigation',
    },
    {
      icon: <Award className="h-6 w-6 text-blue-700" />,
      title: 'Housing Society Redevelopment',
      description: 'Development Agreement vetting, Deemed Conveyance certification, tripartite agreements, and society legal counsel.',
      tag: 'Societies',
    },
  ];

  const faqs = [
    {
      q: 'How does ZipAdvo verify lawyers?',
      a: 'Every advocate on our platform is individually verified against the Bar Council of Maharashtra and Goa registry using their Sanad number. We also verify court practice records, identity documents, and chamber office addresses.',
    },
    {
      q: `What does the ₹${unlockFee} consultation unlock fee cover?`,
      a: `The ₹${unlockFee} facilitation fee unlocks the lawyer’s direct chamber contact details, reserves your priority consultation appointment slot, and provides access to the secure document vault.`,
    },
    {
      q: 'Are my property documents kept secure?',
      a: 'Yes. All uploaded sale deeds, property cards, and 7/12 extracts are stored in private encrypted storage buckets. Documents are only accessible by you and your assigned advocate via time-limited secure links.',
    },
    {
      q: 'Which areas of Mumbai are covered?',
      a: 'We cover all of the Mumbai Metropolitan Region (MMR), including South Mumbai (Fort, Nariman Point), Western Suburbs (Bandra to Borivali), Eastern Suburbs (Ghatkopar to Mulund), Navi Mumbai, and Thane.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 lg:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              Bar Council of Maharashtra Verified Lawyers
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Mumbai&apos;s Trusted Network for <span className="text-blue-400">Property & Document</span> Lawyers
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Get experienced legal advice on title verification, flat registrations, MahaRERA disputes, and society redevelopment with verified Bombay High Court & City Civil advocates.
            </p>

            {/* Search Quick Bar */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                <Link href="/find-lawyer" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" fullWidth leftIcon={<Search className="h-4 w-4" />}>
                    Find a Verified Lawyer
                  </Button>
                </Link>
                <Link href="/how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-800">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Micro Stats */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-xl mx-auto text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white font-mono">100%</p>
                <p className="text-xs text-slate-400">Sanad Verified</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white font-mono">₹{unlockFee}</p>
                <p className="text-xs text-slate-400">Fixed Unlock Fee</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white font-mono">MMR</p>
                <p className="text-xs text-slate-400">Mumbai Jurisdiction</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. TRUST INDICATORS BAR */}
      <section className="border-b border-slate-200 bg-slate-50 py-6">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-6 w-6 text-blue-700 mb-1" />
              <p className="text-sm font-bold text-slate-900">Bar Council Verified</p>
              <p className="text-xs text-slate-500">Every Sanad checked manually</p>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="h-6 w-6 text-blue-700 mb-1" />
              <p className="text-sm font-bold text-slate-900">Encrypted Document Vault</p>
              <p className="text-xs text-slate-500">Private signed URLs for deeds</p>
            </div>
            <div className="flex flex-col items-center">
              <Scale className="h-6 w-6 text-blue-700 mb-1" />
              <p className="text-sm font-bold text-slate-900">Mumbai Local Chambers</p>
              <p className="text-xs text-slate-500">Fort, BKC, Bandra & Dindoshi</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-6 w-6 text-blue-700 mb-1" />
              <p className="text-sm font-bold text-slate-900">Guaranteed Response</p>
              <p className="text-xs text-slate-500">24-hour consultation confirmation</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-16 lg:py-20 bg-white">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="brand">Simple 3-Step Process</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              How ZipAdvo Works
            </h2>
            <p className="text-sm text-slate-600">
              Transparent, professional, and secure legal engagement for your Mumbai property needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-200 shadow-sm relative">
              <div className="absolute -top-3 left-6 bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                01
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-lg">Discover Verified Advocates</CardTitle>
                <CardDescription>
                  Filter lawyers by Mumbai court jurisdiction, practice specialization (Conveyancing, Title Search, RERA), and spoken languages.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 shadow-sm relative">
              <div className="absolute -top-3 left-6 bg-blue-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                02
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-lg">Unlock for ₹{unlockFee} & Share Dossier</CardTitle>
                <CardDescription>
                  Pay the standard ₹{unlockFee} facilitation fee to unlock advocate contact details and upload property deeds securely to your confidential vault.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 shadow-sm relative">
              <div className="absolute -top-3 left-6 bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                03
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-lg">Get Expert Counsel</CardTitle>
                <CardDescription>
                  Consult via video call or at the advocate’s Mumbai chamber, receive verified legal opinions, and proceed with title clearance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </section>

      {/* 4. PRACTICE AREAS / SERVICES */}
      <section className="py-16 lg:py-20 bg-slate-50 border-t border-b border-slate-200">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="navy">Core Expertise</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Specialized Mumbai Legal Services
            </h2>
            <p className="text-sm text-slate-600">
              High-stakes real estate transactions require specialized conveyance and regulatory advocates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, idx) => (
              <Card key={idx} className="border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between shadow-xs">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">{svc.icon}</div>
                    <Badge variant="outline" size="sm">{svc.tag}</Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">{svc.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 pt-1 leading-relaxed">
                    {svc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/find-lawyer" className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1">
                    Find Advocates <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. VERIFIED LAWYER SPOTLIGHT */}
      <section className="py-16 lg:py-20 bg-white">
        <Container className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="brand">Sample Roster</Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Verified Mumbai Advocates
              </h2>
              <p className="text-sm text-slate-600">
                A selection of Bar Council accredited advocates practicing in Mumbai courts.
              </p>
            </div>
            <Link href="/find-lawyer">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All Lawyers
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleLawyers.map((lawyer) => (
              <Card key={lawyer.id} className="border-slate-200 shadow-sm flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={lawyer.name} size="lg" status="online" />
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{lawyer.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">Sanad: {lawyer.sanad}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Verified</Badge>
                  </div>

                  <p className="text-xs font-medium text-slate-700">{lawyer.title}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <p><span className="font-semibold text-slate-800">Courts:</span> {lawyer.court}</p>
                    <p><span className="font-semibold text-slate-800">Experience:</span> {lawyer.experience}</p>
                    <p><span className="font-semibold text-slate-800">Chamber:</span> {lawyer.location}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {lawyer.specialties.map((spec, i) => (
                      <span key={i} className="inline-block bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <Rating value={lawyer.rating} reviewCount={lawyer.reviewCount} showText size="sm" />
                  <Link href={`/lawyers/${lawyer.id}`}>
                    <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Consult (₹{unlockFee})
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. FOR LAWYERS BANNER */}
      <section className="bg-slate-900 text-white py-14 border-t border-slate-800">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 p-8 sm:p-12 border border-slate-800">
            <div className="space-y-3 max-w-xl">
              <Badge variant="brand">Advocate Network</Badge>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Are You an Advocate Practicing in Mumbai?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Join Mumbai&apos;s verified property and conveyance roster. Connect with pre-screened clients, manage digital case briefs, and ensure transparent fees in compliance with Bar Council ethics.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/for-lawyers">
                <Button variant="outline" className="bg-white text-slate-900 border-white hover:bg-slate-100">
                  Learn More
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">
                  Join Verified Roster
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <Container className="space-y-10 max-w-3xl">
          <div className="text-center space-y-3">
            <Badge variant="outline">Common Questions</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about ZipAdvo discovery and booking.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-start gap-2.5">
                    <HelpCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 pl-7 pt-1 leading-relaxed">
                    {faq.a}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
