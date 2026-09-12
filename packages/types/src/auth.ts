/**
 * Authentication and Role-Based Access Control Types
 */

export type UserRole = 'client' | 'lawyer' | 'admin' | 'super_admin';

export type UserPermission =
  | 'lawyer:read'
  | 'lawyer:write_profile'
  | 'lawyer:submit_kyc'
  | 'booking:create'
  | 'booking:read_own'
  | 'booking:manage_assigned'
  | 'document:upload'
  | 'document:read_own'
  | 'document:access_booking'
  | 'admin:verify_lawyer'
  | 'admin:manage_disputes'
  | 'admin:view_all_payments'
  | 'admin:manage_platform_settings'
  | 'admin:audit_logs_read';

export interface AuthClaims {
  uid: string;
  email?: string;
  phone?: string;
  role: UserRole;
  permissions: UserPermission[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
}

export interface SessionUser {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}
