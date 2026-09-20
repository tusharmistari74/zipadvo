'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/context';
import { Spinner, Container, Card, CardContent } from '@legalhub/ui';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isLoginPage = pathname ? pathname.startsWith('/admin/login') : false;

  const isAdmin =
    role === 'admin' ||
    role === 'super_admin' ||
    profile?.role === 'admin' ||
    profile?.role === 'super_admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isLoginPage && (!user || !isAdmin)) {
      router.replace('/admin/login');
    }
  }, [mounted, isLoading, isLoginPage, user, isAdmin, router]);

  // Unrestricted rendering for admin login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // During SSR or initial auth loading, show a stable secure loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-blue-500" />
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono">
            Verifying Administrator Access Credentials...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated as an admin on protected admin routes
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-slate-100">
        <Container className="max-w-md">
          <Card className="border-slate-800 bg-slate-800/90 text-center p-6 text-slate-100 shadow-2xl">
            <CardContent className="space-y-4">
              <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Administrator Privileges Required</h2>
              <p className="text-xs text-slate-400">
                You do not have active administrative credentials to access this console. Redirecting to admin authentication...
              </p>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return <>{children}</>;
}
