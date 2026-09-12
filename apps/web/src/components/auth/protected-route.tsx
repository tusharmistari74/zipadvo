'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import type { UserRole } from '@legalhub/types';
import { Container, Card, CardContent } from '@legalhub/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'lawyer') {
          router.push('/lawyer');
        } else if (role === 'admin' || role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, role, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Container className="max-w-xs text-center">
          <Card className="p-8 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4">
              <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm font-medium text-slate-600">Verifying session...</p>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
