'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Container, Badge } from '@legalhub/ui';
import { useAuth } from '../../../lib/auth/context';

export default function VerifyAccountPage() {
  const router = useRouter();
  const { user, profile, isLawyer } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setStatusMessage(null);

    // Simulate verification check or trigger reload
    setTimeout(() => {
      setIsVerifying(false);
      setStatusMessage('Verification verified successfully.');
      if (isLawyer) {
        router.push('/lawyer/kyc');
      } else {
        router.push('/dashboard');
      }
    }, 800);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <Container className="max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Badge variant="default">Account Security</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Verify Your Account</CardTitle>
            <CardDescription>
              Confirm your identity to unlock all ZipAdvo features
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {user ? (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
                <p className="font-semibold">Logged in as:</p>
                <p className="text-xs text-blue-700 mt-0.5">{profile?.fullName || user.email || user.phoneNumber}</p>
                <p className="text-xs text-blue-600 mt-1">Role: <span className="uppercase font-mono">{profile?.role || 'CLIENT'}</span></p>
              </div>
            ) : null}

            {statusMessage && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleManualVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Verification / Security Code
                </label>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full tracking-widest text-center font-mono text-lg rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isVerifying}>
                Verify & Continue
              </Button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Need help?{' '}
                <Link href="/login" className="font-semibold text-blue-700 hover:underline">
                  Return to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
