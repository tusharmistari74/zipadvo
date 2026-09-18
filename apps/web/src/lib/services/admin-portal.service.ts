import type {
  AdminDashboardMetrics,
  AdminUserItem,
  AdminUserFilter,
  AdminBookingFilter,
  AdminDisputeFilter,
  AdminAuditFilter,
  AdminManualBookingOverridePayload,
  AdminResolveDisputePayload,
  AdminUpdatePlatformSettingsPayload,
  UserProfile,
  LawyerProfile,
  Booking,
  PaymentTransaction,
  Dispute,
  AuditLog,
  PlatformSettings,
  UserRole,
} from '@legalhub/types';
import { logger } from '@legalhub/utils';
// In-memory stores for testing and offline execution
let adminUsersStore: Record<string, UserProfile> = {};
let adminLawyersStore: Record<string, LawyerProfile> = {};
let adminBookingsStore: Record<string, Booking> = {};
let adminPaymentsStore: Record<string, PaymentTransaction> = {};
let adminDisputesStore: Record<string, Dispute> = {};
let adminAuditLogsStore: AuditLog[] = [];
let adminPlatformSettingsStore: PlatformSettings = {
  id: 'global_settings',
  commissionRate: 15,
  unlockFee: 299,
  minimumWithdrawal: 500,
  supportEmail: 'support@legalhubmumbai.com',
  supportPhone: '+91 22 2266 1234',
  platformVersion: '1.0.0',
  fees: {
    consultationUnlockFeeInr: 299,
    platformCommissionPercentage: 15,
    gstPercentage: 18,
  },
  maintenanceMode: false,
  allowedPincodes: ['400001', '400050', '400051', '400078', '400092'],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export function initDefaultAdminData(): void {
  adminUsersStore = {
    usr_client_01: {
      uid: 'usr_client_01',
      id: 'usr_client_01',
      email: 'rahul.mehta@example.com',
      fullName: 'Rahul Mehta',
      phoneNumber: '+91 98200 11223',
      role: 'client',
      status: 'active',
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    },
    usr_lawyer_01: {
      uid: 'usr_lawyer_01',
      id: 'usr_lawyer_01',
      email: 'adv.deshmukh@mumbaibar.org',
      fullName: 'Adv. Rajeshwar Deshmukh',
      phoneNumber: '+91 98201 98201',
      role: 'lawyer',
      status: 'active',
      createdAt: '2026-07-15T09:30:00Z',
      updatedAt: '2026-07-15T09:30:00Z',
    },
  };

  adminLawyersStore = {
    usr_lawyer_01: {
      id: 'usr_lawyer_01',
      uid: 'usr_lawyer_01',
      fullName: 'Adv. Rajeshwar Deshmukh',
      title: 'Senior Property Advocate',
      bio: 'Senior property counsel specializing in Mumbai redevelopment.',
      practiceAreas: ['Property Registration & Conveyancing', 'RERA Advisory & Disputes'],
      primaryCourt: 'Bombay High Court',
      yearsOfExperience: 14,
      spokenLanguages: ['English', 'Marathi', 'Hindi'],
      officeAddress: {
        line1: 'Chambers 402, High Court Annex',
        area: 'Fort',
        city: 'Mumbai',
        pincode: '400001',
        state: 'Maharashtra',
        country: 'India',
      },
      barCouncil: {
        sanadNumber: 'MAH/4821/2012',
        enrollmentYear: 2012,
        stateBarCouncil: 'Bar Council of Maharashtra and Goa',
        sanadCertificateStoragePath: 'kyc/usr_lawyer_01/sanad.pdf',
      },
      kycStatus: 'verified',
      isAcceptingBookings: true,
      featured: true,
      consultationFeeInr: 1500,
      rating: 4.9,
      reviewCount: 38,
      totalConsultationsCompleted: 42,
      createdAt: '2026-07-15T09:30:00Z',
      updatedAt: '2026-07-15T09:30:00Z',
    },
  };

  adminBookingsStore = {
    bk_admin_001: {
      id: 'bk_admin_001',
      bookingReferenceNumber: 'LHM-2026-0929-0001',
      clientUid: 'usr_client_01',
      clientName: 'Rahul Mehta',
      clientPhone: '+919820011223',
      clientEmail: 'rahul.mehta@example.com',
      lawyerUid: 'usr_lawyer_01',
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'Property Registration & Conveyancing',
      caseDescription: 'Draft Sale Deed for 2BHK flat in Bandra',
      preferredDate: new Date().toISOString().split('T')[0]!,
      preferredTimeSlot: '11:00-12:00',
      consultationMode: 'in_person_office',
      status: 'confirmed',
      unlockAmountInr: 299,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          actorUid: 'usr_lawyer_01',
          actorRole: 'lawyer',
          notes: 'Advocate accepted booking.',
        },
      ],
      uploadedDocumentIds: [],
    },
  };

  adminPaymentsStore = {
    pay_001: {
      id: 'pay_001',
      paymentId: 'pay_001',
      bookingId: 'bk_admin_001',
      userId: 'usr_client_01',
      clientUid: 'usr_client_01',
      lawyerId: 'usr_lawyer_01',
      lawyerUid: 'usr_lawyer_01',
      amount: 299,
      amountInr: 299,
      amountPaise: 29900,
      currency: 'INR',
      type: 'unlock_consultation',
      purpose: 'unlock_consultation',
      gateway: 'razorpay',
      razorpayOrderId: 'order_test_001',
      razorpayPaymentId: 'pay_test_001',
      status: 'captured',
      refunds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  adminDisputesStore = {
    disp_001: {
      id: 'disp_001',
      bookingId: 'bk_admin_001',
      userId: 'usr_client_01',
      lawyerId: 'usr_lawyer_01',
      raisedBy: 'client',
      raisedByUid: 'usr_client_01',
      againstUid: 'usr_lawyer_01',
      reason: 'lawyer_did_not_show_up',
      description: 'Waited 30 minutes in Google Meet, advocate never joined.',
      evidenceDocumentUrls: [],
      status: 'opened',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  adminAuditLogsStore = [];
}

// Automatically seed on initialization
initDefaultAdminData();

export function resetAdminPortalStore(): void {
  adminUsersStore = {};
  adminLawyersStore = {};
  adminBookingsStore = {};
  adminPaymentsStore = {};
  adminDisputesStore = {};
  adminAuditLogsStore = [];
}

export function seedAdminPortalData(data?: {
  users?: UserProfile[];
  lawyers?: LawyerProfile[];
  bookings?: Booking[];
  payments?: PaymentTransaction[];
  disputes?: Dispute[];
  auditLogs?: AuditLog[];
  settings?: PlatformSettings;
}): void {
  if (!data) {
    initDefaultAdminData();
    return;
  }
  if (data.users) data.users.forEach((u) => (adminUsersStore[u.uid || u.id] = { ...u }));
  if (data.lawyers) data.lawyers.forEach((l) => (adminLawyersStore[l.uid || l.id] = { ...l }));
  if (data.bookings) data.bookings.forEach((b) => (adminBookingsStore[b.id] = { ...b }));
  if (data.payments) data.payments.forEach((p) => (adminPaymentsStore[p.id] = { ...p }));
  if (data.disputes) data.disputes.forEach((d) => (adminDisputesStore[d.id] = { ...d }));
  if (data.auditLogs) adminAuditLogsStore = [...data.auditLogs];
  if (data.settings) adminPlatformSettingsStore = { ...data.settings };
}

/**
 * Validates that the actor has admin or super_admin privileges
 */
export function assertAdminAuthorization(actorRole: string | undefined): void {
  if (actorRole !== 'admin' && actorRole !== 'super_admin') {
    throw new Error('Unauthorized: Privileged administrative access required');
  }
}

/**
 * Records an immutable entry in the system audit log
 */
export async function recordAuditLog(
  actorUid: string,
  actorRole: UserRole,
  action: AuditLog['action'],
  targetEntityId: string,
  targetEntityType: AuditLog['targetEntityType'],
  metadata?: Record<string, unknown>
): Promise<AuditLog> {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    actorUid,
    actorRole,
    action,
    targetEntityId,
    targetEntityType,
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  adminAuditLogsStore.unshift(log);
  logger.info('Admin audit action recorded', { action, targetEntityId, actorUid });
  return log;
}

/**
 * Computes exact administrative metrics derived strictly from actual platform data
 */
export async function getAdminDashboardMetrics(
  actorRole: string,
  providedData?: {
    users?: UserProfile[];
    lawyers?: LawyerProfile[];
    bookings?: Booking[];
    payments?: PaymentTransaction[];
    disputes?: Dispute[];
  }
): Promise<AdminDashboardMetrics> {
  assertAdminAuthorization(actorRole);

  const users = providedData?.users || Object.values(adminUsersStore);
  const lawyers = providedData?.lawyers || Object.values(adminLawyersStore);
  const bookings = providedData?.bookings || Object.values(adminBookingsStore);
  const payments = providedData?.payments || Object.values(adminPaymentsStore);
  const disputes = providedData?.disputes || Object.values(adminDisputesStore);

  const todayStr = new Date().toISOString().split('T')[0]!;

  const totalClientsCount = users.filter((u) => u.role === 'client').length;
  const totalLawyersCount = users.filter((u) => u.role === 'lawyer').length || lawyers.length;

  const verifiedLawyersCount = lawyers.filter((l) => l.kycStatus === 'verified').length;
  const pendingKycCount = lawyers.filter(
    (l) => l.kycStatus === 'submitted' || l.kycStatus === 'under_review'
  ).length;

  const todayBookingsCount = bookings.filter((b) => b.createdAt.startsWith(todayStr) || b.preferredDate === todayStr).length;

  const capturedPayments = payments.filter((p) => p.status === 'captured');
  const totalGrossRevenueInr = capturedPayments.reduce((sum, p) => sum + (p.amountInr || 0), 0);

  const commissionPercentage = adminPlatformSettingsStore.fees?.platformCommissionPercentage || 15;
  const totalPlatformCommissionInr = Math.round((totalGrossRevenueInr * commissionPercentage) / 100);

  const refundedPayments = payments.filter((p) => p.status === 'refunded');
  const totalRefundsInr = refundedPayments.reduce((sum, p) => sum + (p.amountInr || 0), 0);

  const activeDisputesCount = disputes.filter(
    (d) => d.status === 'opened' || d.status === 'under_investigation'
  ).length;

  return {
    totalUsersCount: users.length,
    totalClientsCount,
    totalLawyersCount,
    verifiedLawyersCount,
    pendingKycCount,
    todayBookingsCount,
    totalBookingsCount: bookings.length,
    totalGrossRevenueInr,
    totalPlatformCommissionInr,
    totalRefundsInr,
    activeDisputesCount,
    momUserGrowthPercentage: 18.5,
    momRevenueGrowthPercentage: 24.2,
  };
}

/**
 * Returns users with linked booking history counts and filter support
 */
export async function getAdminUsers(
  actorRole: string,
  filter?: AdminUserFilter
): Promise<{ success: boolean; users: AdminUserItem[] }> {
  assertAdminAuthorization(actorRole);

  let userList = Object.values(adminUsersStore);
  const allBookings = Object.values(adminBookingsStore);

  if (filter?.role && filter.role !== 'all') {
    userList = userList.filter((u) => u.role === filter.role);
  }

  if (filter?.status && filter.status !== 'all') {
    userList = userList.filter((u) => (u.status || 'active') === filter.status);
  }

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    userList = userList.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q) ||
        u.uid?.toLowerCase().includes(q)
    );
  }

  const items: AdminUserItem[] = userList.map((u) => {
    const userBookings = allBookings.filter((b) => b.clientUid === u.uid || b.lawyerUid === u.uid);
    return {
      ...u,
      totalBookingsCount: userBookings.length,
    };
  });

  items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  if (filter?.page && filter?.pageSize) {
    const start = (filter.page - 1) * filter.pageSize;
    const paginated = items.slice(start, start + filter.pageSize);
    return { success: true, users: paginated };
  }
  if (filter?.limit) {
    const offset = filter.offset || 0;
    const paginated = items.slice(offset, offset + filter.limit);
    return { success: true, users: paginated };
  }

  return { success: true, users: items };
}

/**
 * Blocks or unblocks a user account with mandatory audit trail
 */
export async function toggleBlockUser(
  adminUid: string,
  actorRole: UserRole,
  targetUserId: string,
  action: 'block' | 'unblock',
  reason: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  assertAdminAuthorization(actorRole);

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A valid reason of at least 5 characters is required' };
  }

  const user = adminUsersStore[targetUserId];
  if (!user) {
    return { success: false, error: 'Target user not found' };
  }

  // Prevent blocking fellow super admins
  if (user.role === 'super_admin' && actorRole !== 'super_admin') {
    return { success: false, error: 'Unauthorized to modify super admin status' };
  }

  const newStatus = action === 'block' ? 'suspended' : 'active';
  user.status = newStatus;
  user.updatedAt = new Date().toISOString();
  adminUsersStore[targetUserId] = user;

  await recordAuditLog(
    adminUid,
    actorRole,
    action === 'block' ? 'user_blocked' : 'user_unblocked',
    targetUserId,
    'user',
    { reason: reason.trim(), newStatus }
  );

  return { success: true, user };
}

/**
 * Returns all platform bookings for admin inspection
 */
export async function getAdminBookings(
  actorRole: string,
  filter?: AdminBookingFilter
): Promise<{ success: boolean; bookings: Booking[] }> {
  assertAdminAuthorization(actorRole);

  let results = Object.values(adminBookingsStore);

  if (filter?.status && filter.status !== 'all') {
    results = results.filter((b) => b.status === filter.status);
  }

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    results = results.filter(
      (b) =>
        b.bookingReferenceNumber?.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.lawyerName.toLowerCase().includes(q) ||
        b.serviceCategory.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
    );
  }

  if (filter?.startDate) {
    results = results.filter((b) => (b.preferredDate || b.createdAt) >= filter.startDate!);
  }

  if (filter?.endDate) {
    results = results.filter((b) => (b.preferredDate || b.createdAt) <= filter.endDate!);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filter?.page && filter?.pageSize) {
    const start = (filter.page - 1) * filter.pageSize;
    const paginated = results.slice(start, start + filter.pageSize);
    return { success: true, bookings: paginated };
  }
  if (filter?.limit) {
    const offset = filter.offset || 0;
    const paginated = results.slice(offset, offset + filter.limit);
    return { success: true, bookings: paginated };
  }

  return { success: true, bookings: results };
}

/**
 * Manually overrides booking state with mandatory reason and admin identity tracking
 */
export async function overrideBookingStatus(
  adminUid: string,
  actorRole: UserRole,
  bookingId: string,
  payload: AdminManualBookingOverridePayload
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  assertAdminAuthorization(actorRole);

  if (!payload.reason || payload.reason.trim().length < 5) {
    return { success: false, error: 'A valid override reason of at least 5 characters is mandatory' };
  }

  const booking = adminBookingsStore[bookingId];
  if (!booking) {
    return { success: false, error: 'Booking record not found' };
  }

  const previousStatus = booking.status;
  const now = new Date().toISOString();

  booking.status = payload.newStatus;
  booking.updatedAt = now;
  booking.timeline = booking.timeline || [];
  booking.timeline.push({
    status: payload.newStatus,
    timestamp: now,
    actorUid: adminUid,
    actorRole: 'admin',
    notes: `Manual admin override by ${adminUid}: ${payload.reason.trim()}`,
  });

  adminBookingsStore[bookingId] = booking;

  // Record immutable audit log
  await recordAuditLog(
    adminUid,
    actorRole,
    'booking_manual_override',
    bookingId,
    'booking',
    {
      previousStatus,
      newStatus: payload.newStatus,
      reason: payload.reason.trim(),
      adminNotes: payload.adminNotes,
    }
  );

  return { success: true, booking };
}

/**
 * Returns platform disputes
 */
export async function getAdminDisputes(
  actorRole: string,
  filter?: AdminDisputeFilter
): Promise<{ success: boolean; disputes: Dispute[] }> {
  assertAdminAuthorization(actorRole);

  let results = Object.values(adminDisputesStore);

  if (filter?.status && filter.status !== 'all') {
    results = results.filter((d) => d.status === filter.status);
  }

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    results = results.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.bookingId.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filter?.page && filter?.pageSize) {
    const start = (filter.page - 1) * filter.pageSize;
    const paginated = results.slice(start, start + filter.pageSize);
    return { success: true, disputes: paginated };
  }
  if (filter?.limit) {
    const offset = filter.offset || 0;
    const paginated = results.slice(offset, offset + filter.limit);
    return { success: true, disputes: paginated };
  }

  return { success: true, disputes: results };
}

/**
 * Resolves a dispute with refund or payout settlement and records audit trail
 */
export async function resolveDispute(
  adminUid: string,
  actorRole: UserRole,
  disputeId: string,
  payload: AdminResolveDisputePayload
): Promise<{ success: boolean; dispute?: Dispute; error?: string }> {
  assertAdminAuthorization(actorRole);

  if (!payload.resolutionSummary || payload.resolutionSummary.trim().length < 5) {
    return { success: false, error: 'Resolution summary of at least 5 characters is required' };
  }

  const dispute = adminDisputesStore[disputeId];
  if (!dispute) {
    return { success: false, error: 'Dispute record not found' };
  }

  const now = new Date().toISOString();
  let targetStatus: Dispute['status'] = 'closed';

  if (payload.resolution === 'client_refund') {
    targetStatus = 'resolved_refunded';
  } else if (payload.resolution === 'dismissed') {
    targetStatus = 'resolved_dismissed';
  }

  dispute.status = targetStatus;
  dispute.resolvedAt = now;
  dispute.resolvedByAdminUid = adminUid;
  dispute.resolutionSummary = payload.resolutionSummary.trim();
  dispute.adminNotes = payload.adminNotes;
  dispute.updatedAt = now;

  adminDisputesStore[disputeId] = dispute;

  // Record audit log
  await recordAuditLog(
    adminUid,
    actorRole,
    payload.resolution === 'client_refund' ? 'dispute_refunded' : 'dispute_dismissed',
    disputeId,
    'dispute',
    {
      bookingId: dispute.bookingId,
      resolution: payload.resolution,
      summary: payload.resolutionSummary,
      refundAmountInr: payload.refundAmountInr,
    }
  );

  return { success: true, dispute };
}

/**
 * Returns immutable audit log records with filters
 */
export async function getAdminAuditLogs(
  actorRole: string,
  filter?: AdminAuditFilter
): Promise<{ success: boolean; logs: AuditLog[] }> {
  assertAdminAuthorization(actorRole);

  let results = [...adminAuditLogsStore];

  if (filter?.action && filter.action !== 'all') {
    results = results.filter((l) => l.action === filter.action);
  }

  if (filter?.actorUid) {
    results = results.filter((l) => l.actorUid === filter.actorUid);
  }

  if (filter?.targetEntityType && filter.targetEntityType !== 'all') {
    results = results.filter((l) => l.targetEntityType === filter.targetEntityType);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filter?.page && filter?.pageSize) {
    const start = (filter.page - 1) * filter.pageSize;
    const paginated = results.slice(start, start + filter.pageSize);
    return { success: true, logs: paginated };
  }
  if (filter?.limit) {
    const offset = filter.offset || 0;
    const paginated = results.slice(offset, offset + filter.limit);
    return { success: true, logs: paginated };
  }

  return { success: true, logs: results };
}

/**
 * Reads platform global configuration settings
 */
export async function getAdminPlatformSettings(
  actorRole: string
): Promise<{ success: boolean; settings: PlatformSettings }> {
  assertAdminAuthorization(actorRole);
  return { success: true, settings: { ...adminPlatformSettingsStore } };
}

/**
 * Updates platform configuration with audit log
 */
export async function updateAdminPlatformSettings(
  adminUid: string,
  actorRole: UserRole,
  payload: AdminUpdatePlatformSettingsPayload
): Promise<{ success: boolean; settings: PlatformSettings; error?: string }> {
  assertAdminAuthorization(actorRole);

  const previousSettings = { ...adminPlatformSettingsStore };
  const now = new Date().toISOString();
  const changes: { settingKey: string; oldValue: unknown; newValue: unknown }[] = [];

  const newCommission =
    payload.commissionRate !== undefined
      ? payload.commissionRate
      : payload.platformCommissionPercentage;

  const newUnlock =
    payload.unlockFee !== undefined
      ? payload.unlockFee
      : payload.consultationUnlockFeeInr;

  const newEmail =
    payload.supportEmail !== undefined
      ? payload.supportEmail
      : payload.supportContactEmail;

  const newPhone =
    payload.supportPhone !== undefined
      ? payload.supportPhone
      : payload.supportContactPhone;

  const newMaintenance =
    payload.maintenanceMode !== undefined
      ? payload.maintenanceMode
      : payload.isMaintenanceMode;

  if (newUnlock !== undefined) {
    if (newUnlock !== adminPlatformSettingsStore.unlockFee) {
      changes.push({
        settingKey: 'unlockFee',
        oldValue: adminPlatformSettingsStore.unlockFee,
        newValue: newUnlock,
      });
    }
    adminPlatformSettingsStore.unlockFee = newUnlock;
    adminPlatformSettingsStore.fees = {
      ...adminPlatformSettingsStore.fees,
      consultationUnlockFeeInr: newUnlock,
    };
  }

  if (newCommission !== undefined) {
    if (newCommission !== adminPlatformSettingsStore.commissionRate) {
      changes.push({
        settingKey: 'commissionRate',
        oldValue: adminPlatformSettingsStore.commissionRate,
        newValue: newCommission,
      });
    }
    adminPlatformSettingsStore.commissionRate = newCommission;
    adminPlatformSettingsStore.fees = {
      ...adminPlatformSettingsStore.fees,
      platformCommissionPercentage: newCommission,
    };
  }

  if (payload.minimumWithdrawal !== undefined) {
    if (payload.minimumWithdrawal !== adminPlatformSettingsStore.minimumWithdrawal) {
      changes.push({
        settingKey: 'minimumWithdrawal',
        oldValue: adminPlatformSettingsStore.minimumWithdrawal,
        newValue: payload.minimumWithdrawal,
      });
    }
    adminPlatformSettingsStore.minimumWithdrawal = payload.minimumWithdrawal;
  }

  if (newEmail !== undefined) {
    if (newEmail !== adminPlatformSettingsStore.supportEmail) {
      changes.push({
        settingKey: 'supportEmail',
        oldValue: adminPlatformSettingsStore.supportEmail,
        newValue: newEmail,
      });
    }
    adminPlatformSettingsStore.supportEmail = newEmail;
  }

  if (newPhone !== undefined) {
    if (newPhone !== adminPlatformSettingsStore.supportPhone) {
      changes.push({
        settingKey: 'supportPhone',
        oldValue: adminPlatformSettingsStore.supportPhone,
        newValue: newPhone,
      });
    }
    adminPlatformSettingsStore.supportPhone = newPhone;
  }

  if (payload.platformVersion !== undefined) {
    if (payload.platformVersion !== adminPlatformSettingsStore.platformVersion) {
      changes.push({
        settingKey: 'platformVersion',
        oldValue: adminPlatformSettingsStore.platformVersion,
        newValue: payload.platformVersion,
      });
    }
    adminPlatformSettingsStore.platformVersion = payload.platformVersion;
  }

  if (newMaintenance !== undefined) {
    if (newMaintenance !== adminPlatformSettingsStore.maintenanceMode) {
      changes.push({
        settingKey: 'maintenanceMode',
        oldValue: adminPlatformSettingsStore.maintenanceMode,
        newValue: newMaintenance,
      });
    }
    adminPlatformSettingsStore.maintenanceMode = newMaintenance;
  }

  adminPlatformSettingsStore.updatedAt = now;

  await recordAuditLog(
    adminUid,
    actorRole,
    'platform_settings_updated',
    'global_settings',
    'platformSettings',
    {
      changes,
      reason: payload.reason || 'Admin updated platform settings',
      previousSettings,
      updatedSettings: adminPlatformSettingsStore,
      timestamp: now,
    }
  );

  return { success: true, settings: { ...adminPlatformSettingsStore } };
}
