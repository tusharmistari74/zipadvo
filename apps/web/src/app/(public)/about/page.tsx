import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@legalhub/ui';
import {
  ShieldCheck,
  Scale,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';

export const metadata: Metadata = {
  title: 'About Us | LegalHubMumbai - Mumbai’s Verified Legal Network',
  description:
    'Learn about LegalHubMumbai’s mission to bring transparency, Sanad-verified integrity, and digital security to Mumbai real estate and document conveyance.',
  openGraph: {
    title: 'About LegalHubMumbai - Real Estate & Conveyancing Legal Infrastructure',
    description:
      'Connecting property buyers and document clients with Bar Council-verified advocates across Mumbai City, Suburban, and MMR.',
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Bar Council Verified',
      description:
        'Every advocate on our directory undergoes rigorous credential verification against Bar Council of Maharashtra & Goa records before being listed.',
    },
    {
      icon: Scale,
      title: 'Zero Broker Conflict',
      description:
        'We operate strictly independently of builders, channel partners, and real estate brokers to ensure your legal counsel represents solely your buyer interests.',
    },
    {
      icon: Lock,
      title: 'Data Sovereignty & Encryption',
      description:
        'Your sensitive title deeds, 7/12 extracts, and government IDs are protected with 256-bit encryption, client-side Aadhaar masking, and strict audit logs.',
    },
    {
      icon: Building2,
      title: 'Hyper-Local Mumbai Focus',
      description:
        'From South Mumbai heritage tenancies to suburban redevelopment, SRA plots, and CIDCO transfers, our network covers Mumbai’s unique micro-markets.',
    },
  ];

  const coverageAreas = [
    { name: 'South Mumbai & Fort', desc: 'Bombay High Court, City Civil Court, Old Tenancy & Heritage Properties' },
    { name: 'Western Suburbs (Bandra to Andheri)', desc: 'Bandra Family Court, Dindoshi Court, Society Conveyance & RERA' },
    { name: 'North Suburbs (Borivali to Dahisar)', desc: 'Borivali Court, SRO Registry, New Project Title Due Diligence' },
    { name: 'Central Suburbs (Kurla to Mulund)', desc: 'Kurla SRO, Slum Rehabilitation (SRA) & MHADA Transfers' },
    { name: 'Thane & Dombivli', desc: 'Thane District Court, 7/12 Title Extraction, Township Registrations' },
    { name: 'Navi Mumbai & Panvel', desc: 'CIDCO Transfer Permissions, Panvel SRO, NA Land Verification' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              <Scale className="h-3.5 w-3.5 mr-1" />
              Our Mission & Heritage
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Transforming Property Legal Due Diligence in Mumbai
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              LegalHubMumbai was founded to replace unvetted touts, opaque broker markups, and vulnerable paperwork
              with a transparent, Bar Council-compliant technology platform.
            </p>
          </div>
        </Container>
      </section>

      {/* Story & Context */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                The Mumbai Real Estate Challenge
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                Why Specialized Legal Due Diligence Matters in Mumbai
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>
                  Purchasing real estate in Mumbai is among the most significant financial commitments an individual or family will make.
                  Yet the city’s legal landscape is uniquely complicated: centuries-old leaseholds, complex 30-year title chains,
                  MHADA and SRA regulations, society deemed conveyances, and 36 separate Sub-Registrar offices.
                </p>
                <p>
                  Historically, property buyers relied on builder-appointed legal representatives or uncredentialed intermediaries
                  operating outside registration offices. This frequently led to unresolved title encumbrances, litigation surprises,
                  and exorbitant hidden charges.
                </p>
                <p className="font-medium text-slate-900">
                  LegalHubMumbai provides a clean, independent digital bridge connecting clients directly with verified advocates
                  who protect buyer rights without broker bias.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-2xl bg-slate-900 text-white space-y-6 shadow-xl">
                <h3 className="font-serif text-xl font-bold text-white">Our Commitments to Clients</h3>
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Sanad Verification:</strong> No uncredentialed agents or intermediaries are permitted on the platform.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No Hidden Markups:</strong> Direct access unlock for ₹299; legal consultation fees are agreed directly with your advocate.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Full Data Confidentiality:</strong> Automated Aadhaar masking, banking-grade encryption, and zero third-party data selling.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Bar Council Ethics:</strong> Strict compliance with the Advocates Act, 1961 and BCI professional conduct rules.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12 space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Our Core Principles
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Built on ethics, speed, transparency, and technological excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card key={i} className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{v.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Geographic Jurisdiction Coverage */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-12 space-y-3">
            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Mumbai Metropolitan Region
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Full Sub-Registrar & Court Coverage
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Verified advocates practicing across key judicial forums and registration offices in MMR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageAreas.map((area, i) => (
              <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{area.name}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{area.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/find-lawyer">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Find a Lawyer in Your Area
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Bar Council Intermediary Disclaimer */}
      <section className="border-t border-slate-200 bg-slate-100/70 py-10">
        <Container>
          <div className="mx-auto max-w-4xl text-center space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Statutory Disclosure & BCI Compliance
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              LegalHubMumbai is a technology intermediary and information directory governed by the Information Technology Act, 2000.
              LegalHubMumbai is not a law firm and does not provide legal advice or solicit legal representation on behalf of any advocate.
              All legal consultations, title reports, drafting, and appearances are rendered directly by independent advocates enrolled with the Bar Council of Maharashtra & Goa.
            </p>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
