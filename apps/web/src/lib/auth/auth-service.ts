import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type { UserProfile, UserRole } from '@legalhub/types';
import { logger } from '@legalhub/utils';

export interface UserSyncPayload {
  fullName?: string;
  phoneNumber?: string;
  role?: UserRole;
  avatarUrl?: string;
}

/**
 * Ensures user profile exists in Firestore and updates last login timestamp.
 * Security enforcement: Browser cannot self-assign role = 'admin'.
 */
export async function syncUserProfile(
  user: FirebaseUser,
  additionalData?: UserSyncPayload,
): Promise<UserProfile> {
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  const userSnap = await getDoc(userRef);
  const now = new Date().toISOString();

  // Guard against client-side admin privilege escalation
  let assignedRole: UserRole = 'client';
  if (additionalData?.role === 'lawyer') {
    assignedRole = 'lawyer';
  }

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      id: user.uid,
      uid: user.uid,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber || additionalData?.phoneNumber || '',
      fullName: additionalData?.fullName || user.displayName || 'LegalHub User',
      role: assignedRole,
      status: 'active',
      avatarUrl: additionalData?.avatarUrl || user.photoURL || undefined,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newProfile);
    logger.info('Created new user profile in Firestore', { userId: user.uid });
    return newProfile;
  } else {
    const existingData = userSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = {
      lastLoginAt: now,
      updatedAt: now,
    };

    if (additionalData?.fullName && !existingData.fullName) {
      updates.fullName = additionalData.fullName;
    }
    if (additionalData?.avatarUrl && !existingData.avatarUrl) {
      updates.avatarUrl = additionalData.avatarUrl;
    }

    await updateDoc(userRef, updates);
    return { ...existingData, ...updates };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return syncUserProfile(credential.user);
}

/**
 * Register with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName: string,
  phoneNumber: string,
  role: UserRole = 'client',
): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(credential.user, { displayName: fullName });
  return syncUserProfile(credential.user, { fullName, phoneNumber, role });
}

/**
 * Sign in / Sign up with Google Provider
 */
export async function signInWithGoogle(rolePreference: UserRole = 'client'): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return syncUserProfile(credential.user, { role: rolePreference });
}

/**
 * Initialize reCAPTCHA verifier for Phone Auth
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
}

/**
 * Request Phone OTP via Firebase Auth
 */
export async function requestPhoneOtp(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

/**
 * Confirm Phone OTP Code
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  userData?: UserSyncPayload,
): Promise<UserProfile> {
  const credential = await confirmationResult.confirm(otpCode);
  return syncUserProfile(credential.user, userData);
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
  logger.info('Password reset email requested', { email });
}

/**
 * Sign Out Current User
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
  logger.info('User signed out successfully');
}
