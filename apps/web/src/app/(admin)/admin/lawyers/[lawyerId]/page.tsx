import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

interface AdminLawyerDetailPageProps {
  params: { lawyerId: string };
}

export default function AdminLawyerDetailPage({ params }: AdminLawyerDetailPageProps) {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /admin/lawyers/{params.lawyerId}</Badge>
            </div>
            <CardTitle>Admin - Lawyer Sanad & KYC Review</CardTitle>
            <CardDescription>
              Route foundation established. Document verification, Bar Council cross-check, and approve/reject workflows will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
