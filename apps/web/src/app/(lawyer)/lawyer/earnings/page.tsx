import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function LawyerEarningsPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /lawyer/earnings</Badge>
            </div>
            <CardTitle>Lawyer Earnings & Payouts</CardTitle>
            <CardDescription>
              Route foundation established. Consultation revenues, payout history, and GST invoices will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
