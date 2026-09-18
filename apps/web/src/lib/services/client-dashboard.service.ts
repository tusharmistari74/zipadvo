import type {
  Booking,
  BookingDocument,
  PaymentTransaction,
  AppNotification,
  PublicLawyerProfile,
} from '@legalhub/types';
import { getPublicLawyerProfile } from './lawyer-profile.service';
import { getBookingDocuments } from './document.service';
import { getUserPaymentHistory } from './payment.service';
import { getUserNotifications, getUnreadNotificationCount } from './notifications/notification.service';

// In-memory saved lawyers store (per user)
const savedLawyersStore: Record<string, Set<string>> = {};

export function resetSavedLawyersStore(): void {
  Object.keys(savedLawyersStore).forEach((k) => delete savedLawyersStore[k]);
}

/**
 * Toggles bookmarking / saving an advocate for quick client access
 */
export async function toggleSaveLawyer(
  userId: string,
  lawyerId: string
): Promise<{ success: boolean; isSaved: boolean }> {
  if (!savedLawyersStore[userId]) {
    savedLawyersStore[userId] = new Set<string>();
  }

  const userSet = savedLawyersStore[userId]!;
  let isSaved = false;

  if (userSet.has(lawyerId)) {
    userSet.delete(lawyerId);
    isSaved = false;
  } else {
    userSet.add(lawyerId);
    isSaved = true;
  }

  return { success: true, isSaved };
}

/**
 * Checks if a lawyer is saved by the user
 */
export function isLawyerSaved(userId: string, lawyerId: string): boolean {
  return !!savedLawyersStore[userId]?.has(lawyerId);
}

/**
 * Retrieves all saved lawyers for a user
 */
export async function getSavedLawyers(
  userId: string
): Promise<{ success: boolean; lawyers: PublicLawyerProfile[] }> {
  const savedIds = Array.from(savedLawyersStore[userId] || []);
  const profiles: PublicLawyerProfile[] = [];

  for (const id of savedIds) {
    const profile = await getPublicLawyerProfile(id);
    if (profile) {
      profiles.push(profile);
    }
  }

  return { success: true, lawyers: profiles };
}

export interface ClientDashboardOverview {
  upcomingBooking: Booking | null;
  recentBookings: Booking[];
  recentDocuments: BookingDocument[];
  recentPayments: PaymentTransaction[];
  recentNotifications: AppNotification[];
  unreadNotificationCount: number;
  metrics: {
    activeBookingsCount: number;
    completedBookingsCount: number;
    totalDocumentsCount: number;
    totalAmountPaidInr: number;
  };
}

/**
 * Aggregates client overview metrics with strict tenant isolation
 */
export async function getClientDashboardOverview(
  userId: string,
  allUserBookings: Booking[]
): Promise<ClientDashboardOverview> {
  // Filter client's bookings
  const clientBookings = allUserBookings.filter((b) => b.clientUid === userId);
  clientBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Locate upcoming confirmed/pending appointment
  const upcomingBooking = clientBookings.find(
    (b) => b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'pending_lawyer'
  ) || null;

  // Gather documents across all client bookings
  const allDocs: BookingDocument[] = [];
  for (const b of clientBookings) {
    const docRes = await getBookingDocuments(b.id, userId, 'client');
    if (docRes.success && docRes.documents) {
      allDocs.push(...docRes.documents);
    }
  }
  allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Payments
  const payRes = await getUserPaymentHistory(userId, userId, 'client');
  const payments = payRes.success ? payRes.transactions : [];

  // Notifications
  const notifRes = await getUserNotifications(userId, userId, { limit: 5 });
  const notifications = notifRes.success ? notifRes.notifications : [];
  const unreadRes = await getUnreadNotificationCount(userId, userId);

  // Metrics
  const activeBookingsCount = clientBookings.filter(
    (b) => b.status === 'pending_payment' || b.status === 'pending_lawyer' || b.status === 'confirmed' || b.status === 'in_progress'
  ).length;

  const completedBookingsCount = clientBookings.filter((b) => b.status === 'completed').length;
  const totalAmountPaidInr = payments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + (p.amountInr || 0), 0);

  return {
    upcomingBooking,
    recentBookings: clientBookings.slice(0, 5),
    recentDocuments: allDocs.slice(0, 5),
    recentPayments: payments.slice(0, 5),
    recentNotifications: notifications,
    unreadNotificationCount: unreadRes.count,
    metrics: {
      activeBookingsCount,
      completedBookingsCount,
      totalDocumentsCount: allDocs.length,
      totalAmountPaidInr,
    },
  };
}
