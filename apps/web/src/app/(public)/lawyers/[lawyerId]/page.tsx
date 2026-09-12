import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, Card, CardContent, CardHeader, CardTitle, Badge, Rating, Breadcrumb } from '@legalhub/ui';
import {
  ShieldCheck,
  Scale,
  Building,
  MapPin,
  Languages,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';

interface LawyerProfilePageProps {
  params: { lawyerId: string };
}

export async function generateMetadata({ params: _params }: LawyerProfilePageProps): Promise<Metadata> {
  return {
    title: `Verified Advocate Profile | LegalHubMumbai`,
    description: `View verified credentials, Bar Council enrollment, Mumbai chamber location, and practice specializations for Advocate.`,
  };
}

export default function LawyerProfilePage({ params }: LawyerProfilePageProps) {
  // Demo / Sample profile representation
  const lawyer = {
    id: params.lawyerId,
    fullName: 'Adv. Rajeshwar M. Deshmukh',
    sanadNumber: 'MAH/4821/2012',
    barCouncil: 'Bar Council of Maharashtra & Goa',
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 42,
    location: 'Fort & South Mumbai',
    chamberAddress: '402, Examiner Press Building, Dalal Street, Fort, Mumbai 400001',
    courts: ['Bombay High Court', 'City Civil & Sessions Court, Mumbai', 'MahaRERA Appellate Tribunal'],
    languages: ['English', 'Marathi', 'Hindi', 'Gujarati'],
    bio: 'Specializing in Mumbai real estate title investigations, 30-year search reports, society conveyance, and deemed conveyance proceedings. Over 14 years of extensive litigation and registry practice across South and Suburban Mumbai registration offices.',
    specializations: [
      'Property Title Search & Verification',
      'Deemed Conveyance & Society Transfer',
      'MahaRERA Litigation & Complaints',
      'Sale Deed & Development Agreement Drafting',
      'Sub-Registrar Registration & Stamp Duty',
    ],
    verifiedDocuments: ['Bar Council Sanad Certificate', 'Government Identity Verified', 'Chamber Address Proof'],
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white py-3">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Find a Lawyer', href: '/find-lawyer' },
              { label: lawyer.fullName },
            ]}
          />
        </Container>
      </div>

      <main className="py-8 sm:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Lawyer Bio & Credentials */}
            <div className="lg:col-span-8 space-y-6">
              {/* Header Card */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-serif text-2xl font-bold">
                      RD
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                          {lawyer.fullName}
                        </h1>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          Sanad Verified
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {lawyer.barCouncil} • Enrolled 2012 ({lawyer.experienceYears} Years Practice)
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {lawyer.location}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Rating value={lawyer.rating} size="sm" />
                          <span className="ml-1">4.9 ({lawyer.reviewCount} reviews)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Professional Overview
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {lawyer.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Specializations & Courts */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Practice Specializations & Jurisdiction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Core Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.specializations.map((spec, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800"
                        >
                          <FileCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Primary Courts & Tribunals
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                        {lawyer.courts.map((court, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Scale className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>{court}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Languages Spoken
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700">
                        <Languages className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{lawyer.languages.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chamber Address & Verification Badges */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Chamber & Credential Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Building className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">Registered Chamber</h4>
                      <p className="text-xs sm:text-sm text-slate-700 mt-0.5">{lawyer.chamberAddress}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {lawyer.verifiedDocuments.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-900 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Direct Unlock & Booking Action */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-blue-200 bg-white shadow-md sticky top-24">
                <CardHeader className="bg-slate-900 text-white rounded-t-lg p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-slate-800 text-blue-300 border-slate-700">
                      Facilitation Unlock
                    </Badge>
                    <span className="text-xl font-bold font-serif text-white">₹299</span>
                  </div>
                  <CardTitle className="text-base font-bold text-white pt-2">
                    Direct Chamber & Contact Unlock
                  </CardTitle>
                  <p className="text-xs text-slate-300">
                    One-time facilitation fee. No hidden platform markups.
                  </p>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Direct phone number & WhatsApp contact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Access to encrypted document vault</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Chamber visit or video slot scheduling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>100% refund if advocate is unresponsive &gt;24h</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link href={`/login?redirect=/find-lawyer`}>
                      <Button variant="primary" fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Unlock Contact for ₹299
                      </Button>
                    </Link>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3 text-slate-500" />
                      Secure Razorpay Checkout
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Legal advisory fees are quoted directly by advocate without platform commission cuts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Regulatory Notice */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 space-y-1.5">
                <p className="font-semibold text-slate-700">Bar Council Compliance Notice</p>
                <p className="leading-relaxed">
                  Information displayed is sourced from public records and advocate declaration in compliance with BCI Rule 36. This profile does not constitute legal advertisement or solicitation.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
