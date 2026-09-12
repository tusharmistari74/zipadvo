import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /admin</Badge>
            </div>
            <CardTitle>Admin Governance & Operations Control Panel</CardTitle>
            <CardDescription>
              Route foundation established. Platform metrics, pending lawyer verifications, booking audits, and dispute escalations will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
