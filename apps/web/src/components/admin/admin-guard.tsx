'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import { Spinner } from '@legalhub/ui';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, role, isLoading, isAuthenticated, isAdmin: isAuthAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isAdmin =
    isAuthAdmin ||
    role === 'admin' ||
    role === 'super_admin' ||
    profile?.role === 'admin' ||
    profile?.role === 'super_admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace('/admin/login');
      }
    }
  }, [mounted, isLoading, isAuthenticated, isAdmin, router]);

  if (!mounted || isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-blue-500" />
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono">
            Loading Admin Console...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
