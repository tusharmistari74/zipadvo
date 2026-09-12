import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /admin/settings</Badge>
            </div>
            <CardTitle>Admin - Platform & Fee Settings</CardTitle>
            <CardDescription>
              Route foundation established. Platform parameters, consultation unlock fee (₹299), service categories, and maintenance controls will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
