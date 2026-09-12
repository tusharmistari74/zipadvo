import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function AdminDisputesPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /admin/disputes</Badge>
            </div>
            <CardTitle>Admin - Dispute Mediation & Resolutions</CardTitle>
            <CardDescription>
              Route foundation established. Client/Lawyer dispute escalation, evidence review, and refund determination workflows will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
