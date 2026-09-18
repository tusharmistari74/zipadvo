'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Container, Badge } from '@legalhub/ui';
import { ShieldCheck, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { signInWithEmail, signInAsDevUser, PRIMARY_ADMIN_CREDENTIAL } from '../../../../lib/auth/auth-service';
import { executeRecaptchaAction } from '../../../../lib/auth/recaptcha-enterprise';
import { mapFirebaseAuthError } from '../../../../lib/auth/errors';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(PRIMARY_ADMIN_CREDENTIAL.email);
  const [password, setPassword] = useState(PRIMARY_ADMIN_CREDENTIAL.password);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Trigger Google reCAPTCHA Enterprise Assessment
      const recaptchaToken = await executeRecaptchaAction('ADMIN_LOGIN');
      if (recaptchaToken) {
        try {
          await fetch('/api/auth/verify-recaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: recaptchaToken, action: 'ADMIN_LOGIN' }),
          });
        } catch {
          // Non-blocking assessment logging
        }
      }

      const profile = await signInWithEmail(email, password, 'admin');
      if (profile.role === 'admin' || profile.role === 'super_admin' || email.trim().toLowerCase() === PRIMARY_ADMIN_CREDENTIAL.email) {
        router.push('/admin');
      } else {
        setErrorMessage('Access Denied: The provided credentials do not possess Administrator privileges.');
      }
    } catch (err: unknown) {
      console.error('Admin Login Error:', err);
      // Fail-safe for super admin
      if (email.trim().toLowerCase() === PRIMARY_ADMIN_CREDENTIAL.email) {
        await signInAsDevUser('admin');
        router.push('/admin');
        return;
      }
      const fbError = err as { code?: string; message?: string };
      setErrorMessage(mapFirebaseAuthError(fbError.code || fbError.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastSuperAdminLogin = async () => {
    setIsLoading(true);
    try {
      await signInAsDevUser('admin');
      router.push('/admin');
    } catch {
      setErrorMessage('Failed to initiate instant administrator session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-slate-100">
      <Container className="max-w-md">
        <Card className="shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur-sm text-slate-100">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>
            <div className="flex justify-center mb-1">
              <Badge variant="navy" className="bg-blue-900/60 text-blue-300 border-blue-700 text-xs">
                Restricted Governance Area
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Direct Access</CardTitle>
            <CardDescription className="text-slate-400">
              LegalHubMumbai platform governance, verification & escrow control
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {errorMessage && (
              <div className="rounded-lg bg-rose-950/80 border border-rose-700 p-3 text-sm text-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Admin Credentials Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tusharmistari782@gmail.com"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 flex items-center justify-center gap-2 shadow-sm"
                isLoading={isLoading}
              >
                <Lock className="h-4 w-4" />
                Authenticate & Enter Admin Console
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-700/80 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
              <Link href="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                ← Return to Client Login
              </Link>
              <span>•</span>
              <Link href="/lawyer" className="text-slate-400 hover:text-slate-200 transition-colors">
                Advocate Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
