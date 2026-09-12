import { getAdminAuth } from '../firebase/admin';
import type { AuthClaims, UserRole } from '@legalhub/types';
import { AuthenticationError, AuthorizationError } from '@legalhub/utils';

/**
 * Verifies Firebase ID Token and extracts user claims and role.
 */
export async function verifyAuthToken(idToken: string): Promise<AuthClaims> {
  if (!idToken) {
    throw new AuthenticationError('Missing authentication token');
  }

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const role: UserRole = (decodedToken.role as UserRole) || 'client';
    const permissions = Array.isArray(decodedToken.permissions)
      ? decodedToken.permissions
      : [];

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
      role,
      permissions,
      isEmailVerified: decodedToken.email_verified ?? false,
      isPhoneVerified: Boolean(decodedToken.phone_number),
      kycStatus: decodedToken.kycStatus as AuthClaims['kycStatus'],
    };
  } catch {
    throw new AuthenticationError('Invalid or expired authentication session');
  }
}

/**
 * Server Authorization Guard: Requires any authenticated user.
 */
export async function requireAuth(idToken?: string): Promise<AuthClaims> {
  if (!idToken) {
    throw new AuthenticationError('Authentication required');
  }
  return verifyAuthToken(idToken);
}

/**
 * Server Authorization Guard: Requires one of the specified roles.
 */
export async function requireRole(allowedRoles: UserRole[], idToken?: string): Promise<AuthClaims> {
  const claims = await requireAuth(idToken);
  if (!allowedRoles.includes(claims.role)) {
    throw new AuthorizationError(
      `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${claims.role}`,
    );
  }
  return claims;
}

/**
 * Server Authorization Guard: Requires User / Client role.
 */
export async function requireUser(idToken?: string): Promise<AuthClaims> {
  return requireRole(['client', 'admin', 'super_admin'], idToken);
}

/**
 * Server Authorization Guard: Requires Lawyer role.
 */
export async function requireLawyer(idToken?: string): Promise<AuthClaims> {
  return requireRole(['lawyer', 'admin', 'super_admin'], idToken);
}

/**
 * Server Authorization Guard: Requires Admin role.
 */
export async function requireAdmin(idToken?: string): Promise<AuthClaims> {
  return requireRole(['admin', 'super_admin'], idToken);
}
