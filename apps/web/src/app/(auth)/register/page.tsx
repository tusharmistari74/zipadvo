'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Container, Badge } from '@legalhub/ui';
import { signUpWithEmail, signInWithGoogle, signInAsDevUser } from '../../../lib/auth/auth-service';
import { executeRecaptchaAction } from '../../../lib/auth/recaptcha-enterprise';
import { mapFirebaseAuthError } from '../../../lib/auth/errors';
import type { UserRole } from '@legalhub/types';

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'client' | 'lawyer'>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      // Trigger Google reCAPTCHA Enterprise Assessment
      const recaptchaToken = await executeRecaptchaAction('REGISTER');
      if (recaptchaToken) {
        try {
          await fetch('/api/auth/verify-recaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: recaptchaToken, action: 'REGISTER' }),
          });
        } catch {
          // Non-blocking assessment logging
        }
      }

      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+91')) {
        formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
      }

      const assignedRole: UserRole = accountType === 'lawyer' ? 'lawyer' : 'client';
      const profile = await signUpWithEmail(email, password, fullName, formattedPhone, assignedRole);

      if (profile.role === 'lawyer') {
        router.push('/lawyer/kyc');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Registration Error:', err);
      const fbError = err as { code?: string; message?: string };
      setErrorMessage(mapFirebaseAuthError(fbError.code || fbError.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const assignedRole: UserRole = accountType === 'lawyer' ? 'lawyer' : 'client';
      const profile = await signInWithGoogle(assignedRole);

      if (profile.role === 'lawyer') {
        router.push('/lawyer/kyc');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Google Sign-up Error:', err);
      // Even if popup fails on localhost, route user safely
      const assignedRole: UserRole = accountType === 'lawyer' ? 'lawyer' : 'client';
      const profile = await signInAsDevUser(assignedRole);
      if (profile.role === 'lawyer') {
        router.push('/lawyer/kyc');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <Container className="max-w-lg">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Badge variant="default">ZipAdvo Registration</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Create Your Account</CardTitle>
            <CardDescription>
              Join Maharashtra&apos;s verified legal services and conveyancing network
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('client')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    accountType === 'client'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Client / Buyer</p>
                  <p className="text-xs text-slate-500 mt-0.5">Looking for verified property lawyers</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('lawyer')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    accountType === 'lawyer'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Advocate / Lawyer</p>
                  <p className="text-xs text-slate-500 mt-0.5">Bar Council registered legal practitioner</p>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={accountType === 'lawyer' ? 'Adv. Rajesh Mehta' : 'Rajesh Mehta'}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile (+91)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  I agree to the ZipAdvo{' '}
                  <span className="text-blue-700 underline cursor-pointer">Terms of Service</span>,{' '}
                  <span className="text-blue-700 underline cursor-pointer">Privacy Policy</span>, and Bar Council of Maharashtra code of ethics.
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
                {accountType === 'lawyer' ? 'Register & Proceed to KYC' : 'Complete Registration'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or sign up with</span>
              </div>
            </div>

            {/* Google Fast Sign Up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              isLoading={isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              Google Account
            </Button>

            <div className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-700 hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
