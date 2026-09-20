import type { Metadata } from 'next';
import { Container, Badge } from '@legalhub/ui';
import { Lock, AlertCircle } from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | ZipAdvo - Data Protection & DPDP Compliance',
  description:
    'Learn how ZipAdvo protects your personal data, identity proofs, and property documents in accordance with the Digital Personal Data Protection Act (DPDP), 2023.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              <Lock className="h-3.5 w-3.5 mr-1" />
              Privacy & Data Sovereignty
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500">
              Effective Date: September 12, 2026 | Last Updated: September 20, 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Policy Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl prose prose-slate text-sm sm:text-base leading-relaxed space-y-8">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                Legal Notice & Statutory Compliance
              </p>
              This Privacy Policy reflects ZipAdvo’s operational data architecture under the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000. It is subject to ongoing statutory review by platform legal counsel.
            </div>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">1. Introduction</h2>
              <p className="text-slate-600">
                ZipAdvo (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy, confidentiality, and security of our users (&quot;Clients&quot;) and verified legal practitioners (&quot;Advocates&quot;). This Privacy Policy explains our practices regarding the collection, use, storage, disclosure, and protection of personal data and confidential property documentation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">2. Categories of Data We Collect</h2>
              <p className="text-slate-600">We collect information that is strictly necessary to facilitate legal discovery and conveyancing consultations:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li><strong>Identity Information:</strong> Name, phone number, email address, and role.</li>
                <li><strong>Advocate Verification Data:</strong> Bar Council Sanad enrollment number, date of enrollment, state bar council certificate, chamber address, and years of practice.</li>
                <li><strong>Property & Legal Documentation:</strong> Title deeds, Index II extracts, 7/12 land records, draft sale agreements, society NOCs, and mutation entries uploaded to the digital vault.</li>
                <li><strong>Transaction Records:</strong> Razorpay transaction IDs, timestamp of facilitation fee payment, and invoice records (we do not store credit card numbers or UPI PINs).</li>
                <li><strong>Technical Data:</strong> IP addresses, browser types, session timestamps, and encrypted authentication tokens.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">3. Identity Document & Aadhaar Protection</h2>
              <p className="text-slate-600">
                In strict compliance with UIDAI regulations and Indian data privacy standards:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>We do not mandate Aadhaar submission for client consultation unlocks.</li>
                <li>Where clients upload property documents containing Aadhaar numbers, client-side or server-side redaction mechanisms mask the first 8 digits of the Aadhaar number.</li>
                <li>Advocate identity documents submitted for Sanad verification are stored in restricted-access compliance repositories accessible solely by authorized compliance officers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">4. Purpose of Data Processing</h2>
              <p className="text-slate-600">We process your information exclusively for the following lawful purposes:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>Verifying advocate bar credentials with the Bar Council of Maharashtra & Goa.</li>
                <li>Facilitating direct communication between clients and verified advocates upon payment of the ₹299 facilitation fee.</li>
                <li>Providing encrypted cloud storage for legal documentation shared during active consultations.</li>
                <li>Preventing platform abuse, fraudulent listings, and non-genuine inquiries.</li>
                <li>Complying with statutory reporting requirements under applicable Indian laws.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">5. Data Sharing and Third Parties</h2>
              <p className="text-slate-600">
                <strong>We do not sell, rent, or trade your personal data or property documents to third parties, builders, banks, or marketing aggregators.</strong> Data is shared strictly under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li><strong>With Your Chosen Advocate:</strong> When you initiate a booking and pay the facilitation fee, your contact details and shared documents are made accessible only to that specific advocate.</li>
                <li><strong>Infrastructure Service Providers:</strong> Encrypted hosting providers (Google Cloud / Firebase India region) and payment gateways (Razorpay India) operating under strict data processing agreements.</li>
                <li><strong>Legal & Regulatory Mandate:</strong> When required by a valid court order, warrant, or statutory directive under Indian law.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">6. Data Security & Storage</h2>
              <p className="text-slate-600">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 bit encryption. Cloud infrastructure is hosted within Indian sovereign data centers (GCP Mumbai region). Access controls adhere to the principle of least privilege.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">7. Your Rights Under DPDP Act, 2023</h2>
              <p className="text-slate-600">As a data principal, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>Request access to the summary of personal data being processed.</li>
                <li>Request correction, completion, or updating of inaccurate data.</li>
                <li>Request erasure of your account and associated document records (subject to statutory audit retention periods).</li>
                <li>Nominate an individual to exercise rights in the event of death or incapacity.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">8. Grievance Officer</h2>
              <p className="text-slate-600">
                In accordance with the Information Technology Act, 2000 and DPDP Act, 2023, the details of the Grievance Officer are provided below:
              </p>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs sm:text-sm space-y-1 text-slate-700">
                <p><strong>Name:</strong> Grievance Redressal Officer, ZipAdvo</p>
                <p><strong>Email:</strong> zipadvo@gmail.com</p>
                <p><strong>Address:</strong> Nandanvan appartment, bus stop, 13, Kalyan-Murbad Rd, near prem auto, Purnima, Kalyan, Maharashtra 421301</p>
                <p><strong>Response Timeline:</strong> Within 48 hours of receipt of grievance</p>
              </div>
            </section>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
