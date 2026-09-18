import React from 'react';
import { ProtectedRoute } from '../../components/auth/protected-route';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['client', 'lawyer', 'admin', 'super_admin']}>
      {children}
    </ProtectedRoute>
  );
}
