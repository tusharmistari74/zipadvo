import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@legalhub/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <Container className="max-w-xl">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <Badge variant="success">Phase 01 Technical Verification</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              LegalHubMumbai
            </CardTitle>
            <CardDescription className="text-slate-600 font-medium">
              Production foundation initialized.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-slate-500 border-t pt-4">
            <p>
              Architectural core, TypeScript domain types, Zod validation schemas, PII-safe logging,
              and testing foundation are active.
            </p>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
