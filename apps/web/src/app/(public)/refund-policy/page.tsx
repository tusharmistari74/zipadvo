import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardContent, Badge, Button } from '@legalhub/ui';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';

export const metadata: Metadata = {
  title: 'Refund Policy | ZipAdvo - ₹299 Facilitation Guarantee',
  description:
    'Review the transparent refund policy for ZipAdvo’s ₹299 platform facilitation fee. 100% money-back guarantee if an advocate is unresponsive within 24 hours.',
};

export default function RefundPolicyPage() {
  const eligibleScenarios = [
    {
      title: 'Advocate Unresponsiveness (> 24 Hours)',
      desc: 'If the unlocked advocate fails to acknowledge your consultation request or message within 24 business hours.',
    },
    {
      title: 'Ethical Conflict of Interest',
      desc: 'If the chosen advocate identifies a professional conflict of interest and cannot accept your matter.',
    },
    {
      title: 'Platform Technical Errors',
      desc: 'If payment was successfully debited from your account but the advocate contact details or document vault failed to unlock.',
    },
    {
      title: 'Accidental Duplicate Transactions',
      desc: 'If you were charged more than once for the same lawyer unlock request due to network or gateway glitch.',
    },
  ];

  const ineligibleScenarios = [
    {
      title: 'Consultation Already Commenced',
      desc: 'Once you have connected with the advocate via call, WhatsApp, chamber visit, or video consultation.',
    },
    {
      title: 'Document Review Already Undertaken',
      desc: 'Once the advocate has accessed, reviewed, or commented on your uploaded property documents.',
    },
    {
      title: 'Disagreement on Advocate’s Professional Fee',
      desc: 'The ₹299 fee is solely for platform facilitation. Disagreement on the advocate’s independent fee quote for TSR or drafting is not grounds for a platform refund.',
    },
    {
      title: 'Change of Mind After Receiving Contact',
      desc: 'If you choose not to proceed after obtaining the advocate’s direct verified contact information.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              100% Transparent Guarantee
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Refund & Cancellation Policy
            </h1>
            <p className="text-sm text-slate-500">
              Effective Date: September 12, 2026 | Last Updated: September 20, 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            {/* Overview */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                1. Overview of the ₹299 Facilitation Fee
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                ZipAdvo charges a one-time facilitation unlock fee of ₹299 per lawyer match. This fee maintains our verified Bar Council directory, secures encrypted document storage, and covers direct connectivity. We are committed to a fair and prompt refund process if our service commitments are not met.
              </p>
            </div>

            {/* Eligible Cases */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  2. When You Are Eligible for a Full Refund
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eligibleScenarios.map((sc, i) => (
                  <Card key={i} className="border-emerald-200 bg-emerald-50/30">
                    <CardContent className="p-4 space-y-1">
                      <h3 className="text-sm font-bold text-emerald-950">{sc.title}</h3>
                      <p className="text-xs text-slate-600">{sc.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Ineligible Cases */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-500" />
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  3. When Refunds Do Not Apply
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ineligibleScenarios.map((sc, i) => (
                  <Card key={i} className="border-slate-200 bg-slate-50/60">
                    <CardContent className="p-4 space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{sc.title}</h3>
                      <p className="text-xs text-slate-600">{sc.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Refund Timeline & Process */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                4. Refund Request Process & Timelines
              </h2>
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900">Submit Request:</strong> Request a refund from your Client Dashboard under &quot;Booking History&quot; or email <code>zipadvo@gmail.com</code> with your Booking ID.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900">Verification (Within 12 Hours):</strong> Our support team checks advocate response logs to confirm non-contact.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900">Reversal via Razorpay (5–7 Business Days):</strong> Once approved, the refund is credited directly back to your original payment method (UPI, Card, Netbanking).
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative: Advocate Reassignment */}
            <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-blue-950">Prefer another advocate instead?</h3>
                <p className="text-xs text-blue-800">
                  You can choose to re-allocate your ₹299 unlock token to another verified advocate in Mumbai with zero extra cost.
                </p>
              </div>
              <Link href="/find-lawyer">
                <Button variant="primary" size="sm" className="whitespace-nowrap">
                  Browse Other Lawyers
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
