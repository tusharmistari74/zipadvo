import React from 'react';
import { ProtectedRoute } from '../../components/auth/protected-route';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      {children}
    </ProtectedRoute>
  );
}
