'use client';

import React, { useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@legalhub/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In real production, log safely without PII
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <Container className="max-w-md">
        <Card className="border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-700">An unexpected error occurred</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              We encountered an issue processing your request. Please try again.
            </p>
            <Button variant="primary" onClick={() => reset()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
