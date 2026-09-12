import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function LawyerKycPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /lawyer/kyc</Badge>
            </div>
            <CardTitle>Lawyer Sanad & Bar Council KYC Verification</CardTitle>
            <CardDescription>
              Route foundation established. Maharashtra & Goa Bar Council Sanad verification, PAN validation, and KYC document upload will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
