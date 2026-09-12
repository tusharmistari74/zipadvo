import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

interface LawyerProfilePageProps {
  params: { lawyerId: string };
}

export default function LawyerProfilePage({ params }: LawyerProfilePageProps) {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /lawyers/{params.lawyerId}</Badge>
            </div>
            <CardTitle>Lawyer Profile & Practice Details</CardTitle>
            <CardDescription>
              Route foundation established. Public profile and booking initiation will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
