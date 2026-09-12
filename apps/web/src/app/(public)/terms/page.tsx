import type { Metadata } from 'next';
import { Container, Badge } from '@legalhub/ui';
import { Scale, AlertCircle } from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | LegalHubMumbai - Intermediary Terms & Conditions',
  description:
    'Review the terms of service governing the use of LegalHubMumbai, a technology intermediary platform connecting clients with verified Mumbai advocates.',
};

export default function TermsOfServicePage() {
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
              Effective Date: September 12, 2026 | Last Updated: September 12, 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Terms Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl prose prose-slate text-sm sm:text-base leading-relaxed space-y-8">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                Statutory Disclosure Under Advocates Act, 1961
              </p>
              LegalHubMumbai is a technology intermediary platform and NOT a law firm. In accordance with Rule 36 of the Bar Council of India Rules, this platform does not solicit legal work, advertise legal services, or share professional fees with advocates.
            </div>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p className="text-slate-600">
                By accessing or using LegalHubMumbai (the &quot;Platform&quot;), whether as a Client looking for legal verification or as a practicing Advocate, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the Platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">2. Nature of Platform & Intermediary Status</h2>
              <p className="text-slate-600">
                LegalHubMumbai operates as an intermediary under Section 79 of the Information Technology Act, 2000.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>The Platform does not provide legal advice, draft legal opinions directly, or represent any party in court or before registration authorities.</li>
                <li>No attorney-client relationship is created between LegalHubMumbai and any user. The attorney-client relationship exists solely between the Client and the independent Advocate chosen by the Client.</li>
                <li>Information provided on advocate profile pages (such as years of experience, Sanad verification status, and practice areas) is provided for factual informational purposes to assist users in making informed choices.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">3. Facilitation Fee (₹299)</h2>
              <p className="text-slate-600">
                To initiate a booking and unlock direct communication and encrypted document sharing with a verified advocate, Clients pay a one-time platform facilitation fee of ₹299 (inclusive of applicable GST).
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>The ₹299 fee is solely for platform infrastructure, identity verification, and document vault hosting.</li>
                <li>The ₹299 fee is NOT a legal consultation or retainership fee. Any professional fees for legal title verification, agreement drafting, or sub-registrar representation are settled directly between the Client and the Advocate.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">4. Advocate Eligibility & Sanad Verification</h2>
              <p className="text-slate-600">
                To be listed as a verified advocate on LegalHubMumbai:
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
                To the fullest extent permitted by Indian law, LegalHubMumbai shall not be liable for any indirect, incidental, special, or consequential damages resulting from legal advice rendered by independent advocates, disputes arising between clients and advocates, or delays at government Sub-Registrar Offices.
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
                <p><strong>Legal & Compliance Desk:</strong> legal@legalhubmumbai.com</p>
                <p><strong>Registered Address:</strong> Fort Chambers, Nagindas Master Road, Fort, Mumbai, Maharashtra 400001</p>
              </div>
            </section>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
