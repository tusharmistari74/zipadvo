import {
  collection,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './client';
import type {
  UserProfile,
  LawyerProfile,
  LawyerKYCSubmission,
  Booking,
  PaymentTransaction,
  LegalDocument,
  LawyerReview,
  Dispute,
  AppNotification,
  PlatformSettings,
  AuditLog,
} from '@legalhub/types';

/**
 * Generic Firestore Data Converter ensuring strict TypeScript type safety
 */
function createConverter<T extends object>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T): DocumentData {
      const { id: _, ...data } = modelObject as unknown as Record<string, unknown>;
      return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}

export const COLLECTIONS = {
  USERS: 'users',
  LAWYERS: 'lawyers',
  LAWYER_KYC: 'lawyer_kyc',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  DOCUMENTS: 'documents',
  REVIEWS: 'reviews',
  DISPUTES: 'disputes',
  NOTIFICATIONS: 'notifications',
  PLATFORM_SETTINGS: 'platform_settings',
  AUDIT_LOGS: 'audit_logs',
} as const;

// Typed Firestore Collection References for client-side queries
export const usersCollection = () =>
  collection(db, COLLECTIONS.USERS).withConverter(createConverter<UserProfile>());

export const lawyersCollection = () =>
  collection(db, COLLECTIONS.LAWYERS).withConverter(createConverter<LawyerProfile>());

export const lawyerKycCollection = () =>
  collection(db, COLLECTIONS.LAWYER_KYC).withConverter(createConverter<LawyerKYCSubmission>());

export const bookingsCollection = () =>
  collection(db, COLLECTIONS.BOOKINGS).withConverter(createConverter<Booking>());

export const paymentsCollection = () =>
  collection(db, COLLECTIONS.PAYMENTS).withConverter(createConverter<PaymentTransaction>());

export const documentsCollection = () =>
  collection(db, COLLECTIONS.DOCUMENTS).withConverter(createConverter<LegalDocument>());

export const reviewsCollection = () =>
  collection(db, COLLECTIONS.REVIEWS).withConverter(createConverter<LawyerReview>());

export const disputesCollection = () =>
  collection(db, COLLECTIONS.DISPUTES).withConverter(createConverter<Dispute>());

export const notificationsCollection = () =>
  collection(db, COLLECTIONS.NOTIFICATIONS).withConverter(createConverter<AppNotification>());

export const platformSettingsCollection = () =>
  collection(db, COLLECTIONS.PLATFORM_SETTINGS).withConverter(createConverter<PlatformSettings>());

export const auditLogsCollection = () =>
  collection(db, COLLECTIONS.AUDIT_LOGS).withConverter(createConverter<AuditLog>());
