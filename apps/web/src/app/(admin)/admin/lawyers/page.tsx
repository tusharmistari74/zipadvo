import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function AdminLawyersListPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /admin/lawyers</Badge>
            </div>
            <CardTitle>Admin - Lawyer Verification Queue & Roster</CardTitle>
            <CardDescription>
              Route foundation established. Pending Sanad verification queue and roster controls will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
