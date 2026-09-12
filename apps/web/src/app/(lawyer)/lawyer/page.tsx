import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function LawyerPortalPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /lawyer</Badge>
            </div>
            <CardTitle>Lawyer Portal Overview</CardTitle>
            <CardDescription>
              Route foundation established. Practice metrics, pending consultation requests, and notifications will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
