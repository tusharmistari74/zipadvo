import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@legalhub/ui';
import {
  ShieldCheck,
  Briefcase,
  Users,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Award,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';

export const metadata: Metadata = {
  title: 'For Lawyers | Join LegalHubMumbai - Verified Advocate Network',
  description:
    'Join Mumbai’s dedicated property and conveyancing legal network. Connect with high-intent property buyers, manage clients seamlessly, and maintain 100% of your legal fees.',
  openGraph: {
    title: 'Join LegalHubMumbai as a Verified Property Advocate',
    description:
      'Connect with clients needing title search reports, sale deed drafting, and sub-registrar assistance in Mumbai. BCI-compliant platform with zero fee cuts.',
  },
};

export default function ForLawyersPage() {
  const benefits = [
    {
      icon: Users,
      title: 'High-Intent Property Clients',
      description:
        'Connect directly with property buyers, flat owners, and NRI investors who already have property documents and require immediate legal assistance.',
    },
    {
      icon: Award,
      title: 'Zero Commission on Your Fees',
      description:
        'We do not take a cut of your legal professional fees. You quote and bill your advisory, drafting, and registration fees directly to your clients.',
    },
    {
      icon: ShieldCheck,
      title: 'Bar Council Compliant Intermediary',
      description:
        'Operating strictly within Rule 36 of the Bar Council of India standards. The platform serves as a digital directory and facilitator, never an advertiser or fee-sharer.',
    },
    {
      icon: FileText,
      title: 'Encrypted Digital Chamber',
      description:
        'Access organized client document vaults with 7/12 extracts, Index II records, and chain of deeds in one structured dashboard.',
    },
    {
      icon: Clock,
      title: 'Flexible Schedule & Chamber Bookings',
      description:
        'Set your consultation hours, accept chamber visits at your Fort, Bandra, or suburban office, or offer secure video consultations.',
    },
    {
      icon: Briefcase,
      title: 'Reputation & Verified Badges',
      description:
        'Showcase your verified years of practice, Sanad enrollment, court jurisdictions, and authentic client testimonials.',
    },
  ];

  const verificationSteps = [
    {
      step: '1',
      title: 'Submit Online Profile',
      desc: 'Fill in your professional details, bar enrollment number, chamber address in Mumbai/MMR, and core practice specializations.',
    },
    {
      step: '2',
      title: 'Upload Sanad & Identity Proof',
      desc: 'Submit a scanned copy of your Bar Council Sanad certificate and government ID for our compliance team to review.',
    },
    {
      step: '3',
      title: 'Manual Verification',
      desc: 'Our compliance team checks active enrollment status against Bar Council of Maharashtra & Goa records within 24 to 48 hours.',
    },
    {
      step: '4',
      title: 'Profile Activation',
      desc: 'Receive your Verified Advocate badge and start receiving direct consultation requests from clients in your micro-market.',
    },
  ];

  const faqs = [
    {
      q: 'Does LegalHubMumbai charge advocates a percentage of legal fees?',
      a: 'No. LegalHubMumbai operates on a strict zero-commission model for advocate fees. Clients pay a small ₹299 facilitation unlock fee to the platform, while your professional consultation, drafting, and conveyance fees are settled directly between you and your client.',
    },
    {
      q: 'How does the platform ensure compliance with Bar Council of India rules?',
      a: 'The platform strictly adheres to Rule 36 of the BCI Rules on professional conduct. We provide a factual digital directory with objective credentials (Sanad, experience, practice areas, chamber location) and do not run comparative advertising or promotional claims.',
    },
    {
      q: 'What practice areas are in highest demand?',
      a: 'Property Title Verification & Due Diligence (TSR), Sale Deed / Conveyance Drafting, Sub-Registrar Office (SRO) Registration Assistance, Leave & License Agreements, Redevelopment & SRA Advisory, and RERA complaints.',
    },
    {
      q: 'Can junior advocates or law firms join?',
      a: 'Individual advocates with a valid Sanad from the Bar Council of Maharashtra & Goa can enroll. Law firms can onboard their individual practicing associates as verified counsel.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-slate-900 text-white py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="outline" className="bg-slate-800 text-blue-300 border-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                For Practicing Advocates in Mumbai & MMR
              </Badge>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Grow Your Property Law Practice with Verified Clients
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Connect with flat buyers, real estate investors, and businesses across Mumbai.
                Manage consultations, access pre-screened property documents, and keep 100% of your legal fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/register?role=lawyer">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Apply for Verification
                  </Button>
                </Link>
                <Link href="#verification-process">
                  <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800">
                    How Verification Works
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="border-slate-700 bg-slate-800/90 text-white p-6 shadow-xl">
                <CardHeader className="p-0 pb-4 border-b border-slate-700">
                  <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                    <span>Advocate Eligibility Checklist</span>
                    <Badge variant="navy" className="bg-blue-600 text-white">BCMG</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Active Sanad with Bar Council of Maharashtra & Goa</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Physical chamber or registered office in Mumbai / MMR</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Experience in Property, Conveyance, RERA, or Registration</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Commitment to 24-hour response SLA for unlocked inquiries</span>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <Link href="/register?role=lawyer">
                      <Button variant="primary" fullWidth size="sm">
                        Create Advocate Account
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12 space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Built Specifically for Mumbai Legal Practitioners
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A modern digital platform designed to streamline your daily practice without ethical compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <Card key={i} className="border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs">
                  <CardHeader className="pb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">{b.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">{b.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Verification Process */}
      <section id="verification-process" className="border-y border-slate-200 bg-slate-50/70 py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12 space-y-3">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              Strict Quality Assurance
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              4 Steps to Get Verified & Onboarded
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              We verify every advocate before they appear on the public directory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationSteps.map((s) => (
              <div key={s.step} className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">
                  {s.step}
                </div>
                <h3 className="font-bold text-base text-slate-900">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                Advocate FAQs
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Questions from Legal Practitioners
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

            <div className="pt-8 text-center">
              <Link href="/register?role=lawyer">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Join LegalHubMumbai as an Advocate
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
