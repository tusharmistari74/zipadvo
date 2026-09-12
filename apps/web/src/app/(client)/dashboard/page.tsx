import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function ClientDashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /dashboard</Badge>
            </div>
            <CardTitle>Client Dashboard</CardTitle>
            <CardDescription>
              Route foundation established. Active bookings, uploaded documents, and lawyer consultations list will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
