import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@legalhub/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <Container className="max-w-md">
        <Card className="border-slate-200 text-center shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">404 - Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/">
              <Button variant="primary">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
