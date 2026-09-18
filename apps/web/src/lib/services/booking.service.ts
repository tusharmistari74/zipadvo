import { doc, getDoc, setDoc, collection, getDocs, addDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type {
  Booking,
  BookingStatus,
  BookingTimelineEvent,
  AuditLog,
} from '@legalhub/types';
import {
  createBookingSchema,
  type CreateBookingInput,
} from '@legalhub/validation';
import { reserveBookingSlot } from './availability.service';
import { getPublicLawyerProfile } from './lawyer-profile.service';

// Allowed State Transition Matrix
export const ALLOWED_TRANSITIONS: Record<string, BookingStatus[]> = {
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['pending_lawyer', 'cancelled'],
  pending_unlock_payment: ['pending_lawyer', 'cancelled'],
  pending_lawyer: ['confirmed', 'cancelled'],
  unlocked: ['confirmed', 'cancelled'],
  accepted: ['in_progress', 'cancelled', 'disputed'],
  confirmed: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['completed', 'disputed'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  cancelled_by_client: [], // Terminal state
  cancelled_by_lawyer: [], // Terminal state
  disputed: ['completed', 'cancelled'],
};

// Role-based Transition Permissions
export const ROLE_TRANSITIONS: Record<string, Array<{ from: string; to: BookingStatus }>> = {
  client: [
    { from: 'draft', to: 'pending_payment' },
    { from: 'pending_payment', to: 'pending_lawyer' },
    { from: 'pending_unlock_payment', to: 'pending_lawyer' },
    { from: 'pending_payment', to: 'cancelled' },
    { from: 'pending_unlock_payment', to: 'cancelled' },
    { from: 'pending_lawyer', to: 'cancelled' },
    { from: 'unlocked', to: 'cancelled' },
    { from: 'confirmed', to: 'cancelled' },
    { from: 'accepted', to: 'cancelled' },
    { from: 'confirmed', to: 'disputed' },
    { from: 'in_progress', to: 'disputed' },
  ],
  lawyer: [
    { from: 'pending_lawyer', to: 'confirmed' },
    { from: 'pending_lawyer', to: 'cancelled' },
    { from: 'unlocked', to: 'confirmed' },
    { from: 'unlocked', to: 'cancelled' },
    { from: 'confirmed', to: 'in_progress' },
    { from: 'confirmed', to: 'cancelled' },
    { from: 'accepted', to: 'in_progress' },
    { from: 'accepted', to: 'cancelled' },
    { from: 'in_progress', to: 'completed' },
    { from: 'in_progress', to: 'disputed' },
  ],
  admin: [
    // Admins can execute any structurally valid transition
    { from: 'pending_payment', to: 'pending_lawyer' },
    { from: 'pending_payment', to: 'cancelled' },
    { from: 'pending_lawyer', to: 'confirmed' },
    { from: 'pending_lawyer', to: 'cancelled' },
    { from: 'confirmed', to: 'in_progress' },
    { from: 'confirmed', to: 'cancelled' },
    { from: 'confirmed', to: 'disputed' },
    { from: 'in_progress', to: 'completed' },
    { from: 'in_progress', to: 'disputed' },
    { from: 'disputed', to: 'completed' },
    { from: 'disputed', to: 'cancelled' },
  ],
  super_admin: [
    { from: 'pending_payment', to: 'pending_lawyer' },
    { from: 'pending_payment', to: 'cancelled' },
    { from: 'pending_lawyer', to: 'confirmed' },
    { from: 'pending_lawyer', to: 'cancelled' },
    { from: 'confirmed', to: 'in_progress' },
    { from: 'confirmed', to: 'cancelled' },
    { from: 'confirmed', to: 'disputed' },
    { from: 'in_progress', to: 'completed' },
    { from: 'in_progress', to: 'disputed' },
    { from: 'disputed', to: 'completed' },
    { from: 'disputed', to: 'cancelled' },
  ],
  system: [
    { from: 'pending_payment', to: 'pending_lawyer' },
    { from: 'pending_unlock_payment', to: 'pending_lawyer' },
    { from: 'pending_payment', to: 'cancelled' },
    { from: 'pending_lawyer', to: 'cancelled' },
  ],
};

// In-memory repository for fallback & unit tests
const bookingStore: Record<string, Booking> = {};

export function resetBookingStore(): void {
  Object.keys(bookingStore).forEach((k) => delete bookingStore[k]);
}

/**
 * Validates whether a state transition is permitted for a given caller role
 */
export function canTransitionBookingStatus(
  currentStatus: BookingStatus,
  targetStatus: BookingStatus,
  actorRole: 'client' | 'lawyer' | 'admin' | 'super_admin' | 'system'
): { allowed: boolean; reason?: string } {
  // 1. Check structural lifecycle validity
  const allowedTargets = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedTargets.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid state transition: Cannot transition booking from '${currentStatus}' to '${targetStatus}'.`,
    };
  }

  // 2. Check actor role permissions
  const roleRules = ROLE_TRANSITIONS[actorRole] || [];
  const hasPermission = roleRules.some(
    (rule) =>
      (rule.from === currentStatus || (rule.from === 'pending_payment' && currentStatus === 'pending_unlock_payment')) &&
      rule.to === targetStatus
  );

  if (!hasPermission && actorRole !== 'admin' && actorRole !== 'super_admin') {
    return {
      allowed: false,
      reason: `Permission denied: Role '${actorRole}' is not permitted to transition booking to '${targetStatus}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Generates a unique, professional Mumbai legal-tech reference number
 */
export function generateBookingReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(16).substring(2, 7).toUpperCase();
  return `LHM-${year}-${randomHex}`;
}

/**
 * Creates a new consultation booking in PENDING_PAYMENT status
 */
export async function createBooking(
  input: CreateBookingInput,
  clientUid: string
): Promise<{ success: boolean; error?: string; booking?: Booking }> {
  // 1. Validate Input Schema
  const validation = createBookingSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Invalid booking details',
    };
  }

  const data = validation.data;
  const now = new Date().toISOString();
  const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const referenceNumber = generateBookingReferenceNumber();

  // 2. Cross-verify lawyer availability & profile
  const lawyerProfile = await getPublicLawyerProfile(data.lawyerUid);
  if (!lawyerProfile) {
    return {
      success: false,
      error: 'The selected advocate profile could not be found.',
    };
  }

  if (!lawyerProfile.isAcceptingBookings) {
    return {
      success: false,
      error: 'This advocate is temporarily not accepting new consultation bookings.',
    };
  }

  // 3. Atomically lock the slot via Concurrency Engine
  const slotReservationRes = await reserveBookingSlot({
    lawyerUid: data.lawyerUid,
    date: data.preferredDate,
    slotId: data.preferredTimeSlot,
    clientUid,
    bookingId,
  });

  if (!slotReservationRes.success) {
    return {
      success: false,
      error: slotReservationRes.error || 'Selected time slot is no longer available.',
    };
  }

  // 4. Construct Booking Document
  const initialTimeline: BookingTimelineEvent = {
    status: 'pending_payment',
    timestamp: now,
    actorUid: clientUid,
    actorRole: 'client',
    notes: 'Consultation booking initiated. Awaiting ₹299 contact unlock payment.',
  };

  const newBooking: Booking = {
    id: bookingId,
    bookingReferenceNumber: referenceNumber,
    clientUid,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientEmail: data.clientEmail || undefined,
    lawyerUid: data.lawyerUid,
    lawyerName: lawyerProfile.fullName,
    lawyerTitle: lawyerProfile.title,
    lawyerSanadNumber: lawyerProfile.sanadNumber,
    serviceCategory: data.serviceCategory,
    caseDescription: data.caseDescription,
    preferredDate: data.preferredDate,
    preferredTimeSlot: data.preferredTimeSlot,
    consultationMode: data.consultationMode,
    status: 'pending_payment',
    timeline: [initialTimeline],
    unlockAmountInr: 299,
    consultationFeeInr: lawyerProfile.consultationFeeInr,
    chamberAddress: lawyerProfile.chamberAddress || `${lawyerProfile.locality}, ${lawyerProfile.city}`,
    uploadedDocumentIds: data.uploadedDocumentIds || [],
    createdAt: now,
    updatedAt: now,
  };

  // 5. Save to Memory & Firestore
  bookingStore[bookingId] = newBooking;

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      await setDoc(bookingRef, newBooking);

      // Audit log
      const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
      await addDoc(auditRef, {
        actorUid: clientUid,
        actorRole: 'client',
        action: 'booking_created',
        targetEntityId: bookingId,
        targetEntityType: 'booking',
        metadata: {
          referenceNumber,
          lawyerUid: data.lawyerUid,
          date: data.preferredDate,
          timeSlot: data.preferredTimeSlot,
        },
        createdAt: now,
        updatedAt: now,
      } as unknown as AuditLog);
    } catch {
      // Memory store fallback
    }
  }

  return { success: true, booking: newBooking };
}

/**
 * Fetches booking details with strict multi-tenant authorization
 */
export async function getBookingById(
  bookingId: string,
  callerUid: string,
  callerRole: 'client' | 'lawyer' | 'admin' | 'super_admin'
): Promise<{ success: boolean; error?: string; booking?: Booking }> {
  let booking: Booking | null = bookingStore[bookingId] || null;

  if (!booking && typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const snap = await getDoc(bookingRef);

      if (snap.exists()) {
        booking = snap.data() as Booking;
      }
    } catch {
      // Check fallback store
    }
  }

  if (!booking) {
    return {
      success: false,
      error: 'Booking not found.',
    };
  }

  // Security Authorization Check:
  // Admins can see all; Clients only see own; Lawyers only see assigned
  const isAuthorized =
    callerRole === 'admin' ||
    callerRole === 'super_admin' ||
    (callerRole === 'client' && booking.clientUid === callerUid) ||
    (callerRole === 'lawyer' && booking.lawyerUid === callerUid);

  if (!isAuthorized) {
    return {
      success: false,
      error: 'Access Denied: You do not have permission to view this booking.',
    };
  }

  return { success: true, booking };
}

/**
 * Transitions booking state with strict state machine and role validation
 */
export async function transitionBookingStatus(params: {
  bookingId: string;
  targetStatus: BookingStatus;
  actorUid: string;
  actorRole: 'client' | 'lawyer' | 'admin' | 'super_admin' | 'system';
  notes?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string; booking?: Booking }> {
  const { bookingId, targetStatus, actorUid, actorRole, notes, metadata } = params;

  // 1. Fetch current booking
  const fetchRes = await getBookingById(bookingId, actorUid, actorRole === 'system' ? 'admin' : actorRole);
  if (!fetchRes.success || !fetchRes.booking) {
    return {
      success: false,
      error: fetchRes.error || 'Booking not found or access denied.',
    };
  }

  const currentBooking = fetchRes.booking;

  // 2. Validate state machine transition
  const check = canTransitionBookingStatus(currentBooking.status, targetStatus, actorRole);
  if (!check.allowed) {
    return {
      success: false,
      error: check.reason,
    };
  }

  const now = new Date().toISOString();

  // 3. Construct new timeline event
  const newTimelineEvent: BookingTimelineEvent = {
    status: targetStatus,
    timestamp: now,
    actorUid,
    actorRole: actorRole === 'super_admin' ? 'admin' : actorRole,
    notes: notes || `Booking transitioned to ${targetStatus.replace(/_/g, ' ')}`,
    metadata,
  };

  const updatedTimeline = [...currentBooking.timeline, newTimelineEvent];

  const updatedBooking: Booking = {
    ...currentBooking,
    status: targetStatus,
    timeline: updatedTimeline,
    updatedAt: now,
  };

  // 4. Handle Side Effects
  if (targetStatus === 'cancelled') {
    // Release slot reservation
    const reservationKey = `${currentBooking.lawyerUid}_${currentBooking.preferredDate}_${currentBooking.preferredTimeSlot}`;
    try {
      const resRef = doc(db, 'slot_reservations', reservationKey);
      await setDoc(resRef, { status: 'released', updatedAt: now }, { merge: true });
    } catch {
      // no-op
    }

    updatedBooking.cancellationReason = notes || 'Cancelled by user';
    updatedBooking.cancellationDetails = {
      reason: notes || 'Cancelled by user',
      cancelledByUid: actorUid,
      cancelledByRole: actorRole === 'super_admin' ? 'admin' : actorRole,
      cancelledAt: now,
      refundEligible: currentBooking.status === 'pending_payment' || currentBooking.status === 'pending_lawyer',
    };
  }

  // 5. Persist to Memory & Firestore
  bookingStore[bookingId] = updatedBooking;

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      await setDoc(bookingRef, updatedBooking, { merge: true });

      // Audit Log
      const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
      await addDoc(auditRef, {
        actorUid,
        actorRole: actorRole === 'super_admin' ? 'admin' : actorRole,
        action: 'booking_status_updated',
        targetEntityId: bookingId,
        targetEntityType: 'booking',
        metadata: {
          previousStatus: currentBooking.status,
          newStatus: targetStatus,
          notes,
        },
        createdAt: now,
        updatedAt: now,
      } as unknown as AuditLog);
    } catch {
      // Memory fallback
    }
  }

  return { success: true, booking: updatedBooking };
}

/**
 * Cancels a booking with reason recording and slot release
 */
export async function cancelBooking(params: {
  bookingId: string;
  actorUid: string;
  actorRole: 'client' | 'lawyer' | 'admin' | 'super_admin';
  reason: string;
}): Promise<{ success: boolean; error?: string; booking?: Booking }> {
  const { bookingId, actorUid, actorRole, reason } = params;

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: 'A cancellation explanation (minimum 5 characters) is mandatory.',
    };
  }

  return transitionBookingStatus({
    bookingId,
    targetStatus: 'cancelled',
    actorUid,
    actorRole,
    notes: reason.trim(),
    metadata: { cancellationReason: reason.trim() },
  });
}

/**
 * Queries bookings list for a specific client or lawyer
 */
export async function listUserBookings(params: {
  userUid: string;
  role: 'client' | 'lawyer' | 'admin';
  status?: BookingStatus | 'all';
}): Promise<Booking[]> {
  const { userUid, role, status } = params;

  try {
    const fieldName = role === 'lawyer' ? 'lawyerUid' : 'clientUid';
    const bookingsColl = collection(db, COLLECTIONS.BOOKINGS);

    let q = query(bookingsColl, where(fieldName, '==', userUid), orderBy('createdAt', 'desc'), limit(50));
    if (status && status !== 'all') {
      q = query(bookingsColl, where(fieldName, '==', userUid), where('status', '==', status), limit(50));
    }

    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Booking);
    }
  } catch {
    // Fallback store filter
  }

  const all = Object.values(bookingStore);
  let filtered = all.filter((b) => (role === 'lawyer' ? b.lawyerUid === userUid : b.clientUid === userUid));

  if (status && status !== 'all') {
    filtered = filtered.filter((b) => b.status === status);
  }

  return filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
