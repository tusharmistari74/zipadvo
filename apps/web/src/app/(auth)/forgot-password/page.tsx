'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Container, Badge } from '@legalhub/ui';
import { sendPasswordReset } from '../../../lib/auth/auth-service';
import { mapFirebaseAuthError } from '../../../lib/auth/errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const fbError = err as { code?: string; message?: string };
      setErrorMessage(mapFirebaseAuthError(fbError.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <Container className="max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Badge variant="default">Account Recovery</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Reset Password</CardTitle>
            <CardDescription>
              Enter the email address associated with your LegalHubMumbai account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm">
                  <p className="font-semibold mb-1">Password Reset Link Sent</p>
                  <p>
                    If an account exists for <span className="font-medium">{email}</span>, you will receive an email instructions to reset your password.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Send Password Reset Instructions
                </Button>

                <div className="text-center text-xs text-slate-500 pt-2">
                  Remember your password?{' '}
                  <Link href="/login" className="font-semibold text-blue-700 hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
