import React from 'react';
import { ProtectedRoute } from '../../components/auth/protected-route';

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['lawyer', 'admin', 'super_admin']}>
      {children}
    </ProtectedRoute>
  );
}
