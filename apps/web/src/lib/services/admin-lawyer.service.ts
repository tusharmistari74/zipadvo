import { doc, getDoc, setDoc, collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type {
  LawyerProfile,
  LawyerKYCStatus,
  LawyerKYCSubmission,
  AuditLog,
  PracticeArea,
  MumbaiCourt,
} from '@legalhub/types';

export interface AdminLawyerFilter {
  status?: 'all' | 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected' | 'suspended';
  searchQuery?: string;
  court?: string;
  practiceArea?: string;
}

export interface AdminLawyerListItem {
  id: string;
  uid: string;
  fullName: string;
  sanadNumber: string;
  enrollmentYear: number;
  primaryCourt: MumbaiCourt;
  practiceAreas: PracticeArea[];
  locality: string;
  city: string;
  experienceYears: number;
  kycStatus: LawyerKYCStatus;
  submittedAt?: string;
  verifiedAt?: string;
  consultationFeeInr: number;
  rating: number;
  reviewCount: number;
}

export interface AdminLawyerDetail extends AdminLawyerListItem {
  email?: string;
  phone?: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  spokenLanguages: string[];
  chamberAddress: string;
  landmark?: string;
  stateBarCouncil: string;
  isAcceptingBookings: boolean;
  kycSubmission?: LawyerKYCSubmission;
  rejectionReason?: string;
}

// Sample mock repository for demo and testing resilience
const SAMPLE_ADMIN_LAWYERS: AdminLawyerDetail[] = [
  {
    id: 'lawyer-pending-1',
    uid: 'lawyer-pending-1',
    fullName: 'Adv. Anant R. Joshi',
    email: 'anant.joshi@mumbaibar.org',
    phone: '+91 98201 12345',
    title: 'Property & Conveyancing Counsel',
    bio: 'Over 9 years practicing at City Civil and Sessions Court (Fort) and Bombay High Court. Extensive experience in title verification, deemed conveyance proceedings, and MHADA society NOCs.',
    sanadNumber: 'MAH/5612/2017',
    enrollmentYear: 2017,
    stateBarCouncil: 'Bar Council of Maharashtra and Goa',
    primaryCourt: 'City Civil and Sessions Court (Fort)',
    practiceAreas: ['Property Registration & Conveyancing', 'Title Verification & Due Diligence', 'Society Matters & Redevelopment'],
    locality: 'Fort',
    city: 'Mumbai',
    chamberAddress: '302, Standard Building, DN Road, Fort, Mumbai 400001',
    landmark: 'Opposite Flora Fountain',
    experienceYears: 9,
    spokenLanguages: ['English', 'Marathi', 'Hindi'],
    kycStatus: 'submitted',
    submittedAt: '2026-09-10T14:30:00Z',
    consultationFeeInr: 1500,
    isAcceptingBookings: true,
    rating: 5.0,
    reviewCount: 0,
    kycSubmission: {
      id: 'lawyer-pending-1',
      panNumberEncrypted: 'ABCDE5612J',
      panCardStoragePath: 'lawyer_kyc/lawyer-pending-1/pan_card.pdf',
      aadhaarLastFour: '4512',
      aadhaarProofStoragePath: 'lawyer_kyc/lawyer-pending-1/aadhaar_masked.pdf',
      sanadNumber: 'MAH/5612/2017',
      sanadCertificateStoragePath: 'lawyer_kyc/lawyer-pending-1/sanad_certificate.pdf',
      officeProofStoragePath: 'lawyer_kyc/lawyer-pending-1/chamber_electricity_bill.pdf',
      submittedAt: '2026-09-10T14:30:00Z',
    },
  },
  {
    id: 'lawyer-pending-2',
    uid: 'lawyer-pending-2',
    fullName: 'Adv. Sneha N. Mehta',
    email: 'sneha.mehta@advocates.in',
    phone: '+91 98199 87654',
    title: 'MahaRERA & Real Estate Litigator',
    bio: 'Specialist in consumer and homebuyer representation before MahaRERA and Bombay High Court. Drafts Builder-Buyer agreements, revocation notices, and joint development agreements.',
    sanadNumber: 'MAH/2389/2019',
    enrollmentYear: 2019,
    stateBarCouncil: 'Bar Council of Maharashtra and Goa',
    primaryCourt: 'MahaRERA Tribunal (Bandra-Kurla Complex)',
    practiceAreas: ['RERA Advisory & Disputes', 'Property Registration & Conveyancing', 'Civil & Property Litigation'],
    locality: 'Bandra West',
    city: 'Mumbai',
    chamberAddress: '201, Landmark Arcade, Hill Road, Bandra West, Mumbai 400050',
    landmark: 'Near Mehboob Studio',
    experienceYears: 7,
    spokenLanguages: ['English', 'Gujarati', 'Hindi', 'Marathi'],
    kycStatus: 'under_review',
    submittedAt: '2026-09-08T11:00:00Z',
    consultationFeeInr: 1200,
    isAcceptingBookings: true,
    rating: 5.0,
    reviewCount: 0,
    kycSubmission: {
      id: 'lawyer-pending-2',
      panNumberEncrypted: 'MNPQR2389S',
      panCardStoragePath: 'lawyer_kyc/lawyer-pending-2/pan_card.pdf',
      aadhaarLastFour: '8921',
      aadhaarProofStoragePath: 'lawyer_kyc/lawyer-pending-2/aadhaar_masked.pdf',
      sanadNumber: 'MAH/2389/2019',
      sanadCertificateStoragePath: 'lawyer_kyc/lawyer-pending-2/sanad_certificate.pdf',
      submittedAt: '2026-09-08T11:00:00Z',
    },
  },
  {
    id: 'lawyer-1',
    uid: 'lawyer-1',
    fullName: 'Adv. Rajeshwar M. Deshmukh',
    email: 'rajeshwar.deshmukh@law.in',
    phone: '+91 98200 44556',
    title: 'Senior Property & Conveyancing Advocate',
    bio: '14 years of practice specializing in Mumbai real estate title investigations, 30-year search reports, and deemed conveyance proceedings.',
    sanadNumber: 'MAH/4821/2012',
    enrollmentYear: 2012,
    stateBarCouncil: 'Bar Council of Maharashtra and Goa',
    primaryCourt: 'Bombay High Court',
    practiceAreas: ['Property Registration & Conveyancing', 'Title Verification & Due Diligence', 'RERA Advisory & Disputes'],
    locality: 'Fort & South Mumbai',
    city: 'Mumbai',
    chamberAddress: '402, Examiner Press Building, Dalal Street, Fort, Mumbai 400001',
    landmark: 'Opposite Bombay Stock Exchange',
    experienceYears: 14,
    spokenLanguages: ['English', 'Marathi', 'Hindi', 'Gujarati'],
    kycStatus: 'verified',
    submittedAt: '2026-07-01T10:00:00Z',
    verifiedAt: '2026-07-02T15:30:00Z',
    consultationFeeInr: 1500,
    isAcceptingBookings: true,
    rating: 4.9,
    reviewCount: 48,
    kycSubmission: {
      id: 'lawyer-1',
      panNumberEncrypted: 'ABCDE4821R',
      panCardStoragePath: 'lawyer_kyc/lawyer-1/pan.pdf',
      aadhaarLastFour: '4821',
      aadhaarProofStoragePath: 'lawyer_kyc/lawyer-1/aadhaar.pdf',
      sanadNumber: 'MAH/4821/2012',
      sanadCertificateStoragePath: 'lawyer_kyc/lawyer-1/sanad.pdf',
      submittedAt: '2026-07-01T10:00:00Z',
      verifiedAt: '2026-07-02T15:30:00Z',
      verifiedByAdminUid: 'admin-super-uid',
    },
  },
  {
    id: 'lawyer-rejected-1',
    uid: 'lawyer-rejected-1',
    fullName: 'Adv. Vikram T. Sawant',
    email: 'vikram.sawant@example.com',
    phone: '+91 98333 11223',
    title: 'Property Advocate',
    bio: 'Practicing at Thane Court.',
    sanadNumber: 'MAH/9999/2020',
    enrollmentYear: 2020,
    stateBarCouncil: 'Bar Council of Maharashtra and Goa',
    primaryCourt: 'Thane District Court',
    practiceAreas: ['Property Registration & Conveyancing'],
    locality: 'Thane',
    city: 'Thane',
    chamberAddress: 'Chamber 12, Court Naka, Thane West 400601',
    experienceYears: 4,
    spokenLanguages: ['English', 'Marathi'],
    kycStatus: 'rejected',
    submittedAt: '2026-08-15T09:00:00Z',
    rejectionReason: 'Uploaded Sanad certificate scan is illegible and Bar enrollment number does not match submitted PAN identity.',
    consultationFeeInr: 1000,
    isAcceptingBookings: false,
    rating: 5.0,
    reviewCount: 0,
    kycSubmission: {
      id: 'lawyer-rejected-1',
      panNumberEncrypted: 'XYZWS9999V',
      panCardStoragePath: 'lawyer_kyc/lawyer-rejected-1/pan.pdf',
      aadhaarLastFour: '9999',
      aadhaarProofStoragePath: 'lawyer_kyc/lawyer-rejected-1/aadhaar.pdf',
      sanadNumber: 'MAH/9999/2020',
      sanadCertificateStoragePath: 'lawyer_kyc/lawyer-rejected-1/sanad_blurred.pdf',
      submittedAt: '2026-08-15T09:00:00Z',
      rejectionReason: 'Uploaded Sanad certificate scan is illegible and Bar enrollment number does not match submitted PAN identity.',
    },
  },
];

/**
 * List lawyers for admin review with filtering and search
 */
export async function listAdminLawyers(filter: AdminLawyerFilter = {}): Promise<AdminLawyerListItem[]> {
  try {
    const lawyersRef = collection(db, COLLECTIONS.LAWYERS);
    const q = query(lawyersRef, limit(100));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const lawyers = snapshot.docs.map((d) => {
        const data = d.data() as LawyerProfile;
        return {
          id: d.id,
          uid: data.uid || d.id,
          fullName: data.fullName || 'Advocate',
          sanadNumber: data.barCouncil?.sanadNumber || 'MAH/PENDING',
          enrollmentYear: data.barCouncil?.enrollmentYear || 2015,
          primaryCourt: data.primaryCourt || 'Bombay High Court',
          practiceAreas: data.practiceAreas || [],
          locality: data.officeAddress?.area || 'Mumbai',
          city: data.officeAddress?.city || 'Mumbai',
          experienceYears: data.yearsOfExperience || 1,
          kycStatus: data.kycStatus || 'submitted',
          consultationFeeInr: data.consultationFeeInr || 1000,
          rating: data.rating || 5.0,
          reviewCount: data.reviewCount || 0,
        } as AdminLawyerListItem;
      });

      return applyAdminFilters(lawyers, filter);
    }
  } catch {
    // Fallback to sample repository
  }

  return applyAdminFilters(SAMPLE_ADMIN_LAWYERS, filter);
}

function applyAdminFilters(
  list: AdminLawyerListItem[],
  filter: AdminLawyerFilter
): AdminLawyerListItem[] {
  let result = [...list];

  // 1. Status Filter
  if (filter.status && filter.status !== 'all') {
    if (filter.status === 'pending') {
      result = result.filter((l) => l.kycStatus === 'submitted' || l.kycStatus === 'under_review');
    } else {
      result = result.filter((l) => l.kycStatus === filter.status);
    }
  }

  // 2. Search Query (Name, Sanad, Locality)
  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    result = result.filter(
      (l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.sanadNumber.toLowerCase().includes(q) ||
        l.locality.toLowerCase().includes(q)
    );
  }

  // 3. Court Filter
  if (filter.court && filter.court !== 'all') {
    result = result.filter((l) => l.primaryCourt === filter.court);
  }

  // 4. Practice Area Filter
  if (filter.practiceArea && filter.practiceArea !== 'all') {
    result = result.filter((l) =>
      l.practiceAreas.some((p) => p.toLowerCase().includes(filter.practiceArea!.toLowerCase()))
    );
  }

  return result;
}

/**
 * Fetch detailed application profile for Admin review (combines public profile and private KYC documents)
 */
export async function getAdminLawyerDetail(lawyerId: string): Promise<AdminLawyerDetail | null> {
  try {
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, lawyerId);
    const lawyerSnap = await getDoc(lawyerRef);

    const kycRef = doc(db, COLLECTIONS.LAWYER_KYC, lawyerId);
    const kycSnap = await getDoc(kycRef);

    if (lawyerSnap.exists()) {
      const lawyerData = lawyerSnap.data() as LawyerProfile;
      const kycData = kycSnap.exists() ? (kycSnap.data() as LawyerKYCSubmission) : undefined;

      return {
        id: lawyerSnap.id,
        uid: lawyerData.uid || lawyerSnap.id,
        fullName: lawyerData.fullName,
        title: lawyerData.title || 'Advocate',
        bio: lawyerData.bio || '',
        avatarUrl: lawyerData.avatarUrl,
        sanadNumber: lawyerData.barCouncil?.sanadNumber || 'MAH/PENDING',
        enrollmentYear: lawyerData.barCouncil?.enrollmentYear || 2015,
        stateBarCouncil: lawyerData.barCouncil?.stateBarCouncil || 'Bar Council of Maharashtra and Goa',
        primaryCourt: lawyerData.primaryCourt || 'Bombay High Court',
        practiceAreas: lawyerData.practiceAreas || [],
        locality: lawyerData.officeAddress?.area || 'Mumbai',
        city: lawyerData.officeAddress?.city || 'Mumbai',
        chamberAddress: lawyerData.officeAddress
          ? `${lawyerData.officeAddress.line1}, ${lawyerData.officeAddress.area}, ${lawyerData.officeAddress.city} ${lawyerData.officeAddress.pincode}`
          : 'Registered Chamber, Mumbai',
        landmark: lawyerData.officeAddress?.landmark,
        experienceYears: lawyerData.yearsOfExperience || 1,
        spokenLanguages: lawyerData.spokenLanguages || ['English', 'Marathi', 'Hindi'],
        kycStatus: lawyerData.kycStatus || 'submitted',
        submittedAt: kycData?.submittedAt,
        verifiedAt: kycData?.verifiedAt,
        rejectionReason: kycData?.rejectionReason,
        consultationFeeInr: lawyerData.consultationFeeInr || 1000,
        isAcceptingBookings: lawyerData.isAcceptingBookings ?? true,
        rating: lawyerData.rating || 5.0,
        reviewCount: lawyerData.reviewCount || 0,
        kycSubmission: kycData,
      };
    }
  } catch {
    // Fallback to sample repository
  }

  const sample = SAMPLE_ADMIN_LAWYERS.find((l) => l.id === lawyerId || l.uid === lawyerId);
  return sample || null;
}

/**
 * Approves lawyer KYC and activates verified status
 */
export async function approveLawyerKyc(
  adminUid: string,
  lawyerId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  try {
    // 1. Update /lawyers/{lawyerId}
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, lawyerId);
    await setDoc(
      lawyerRef,
      {
        kycStatus: 'verified',
        isAcceptingBookings: true,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Update /lawyer_kyc/{lawyerId}
    const kycRef = doc(db, COLLECTIONS.LAWYER_KYC, lawyerId);
    await setDoc(
      kycRef,
      {
        verifiedAt: now,
        verifiedByAdminUid: adminUid,
        adminNotes: notes || 'Bar Council Sanad verified successfully',
      },
      { merge: true }
    );

    // 3. Log Audit Event
    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: adminUid,
      actorRole: 'admin',
      action: 'lawyer_kyc_approved',
      targetEntityId: lawyerId,
      targetEntityType: 'lawyer',
      metadata: { adminNotes: notes },
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to approve lawyer',
    };
  }
}

/**
 * Rejects lawyer KYC with a mandatory explanation reason
 */
export async function rejectLawyerKyc(
  adminUid: string,
  lawyerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!reason || reason.trim().length < 10) {
    return {
      success: false,
      error: 'A detailed rejection reason is mandatory (minimum 10 characters).',
    };
  }

  const now = new Date().toISOString();

  try {
    // 1. Update /lawyers/{lawyerId}
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, lawyerId);
    await setDoc(
      lawyerRef,
      {
        kycStatus: 'rejected',
        isAcceptingBookings: false,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Update /lawyer_kyc/{lawyerId}
    const kycRef = doc(db, COLLECTIONS.LAWYER_KYC, lawyerId);
    await setDoc(
      kycRef,
      {
        rejectionReason: reason.trim(),
        rejectedAt: now,
        verifiedByAdminUid: adminUid,
      },
      { merge: true }
    );

    // 3. Log Audit Event
    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: adminUid,
      actorRole: 'admin',
      action: 'lawyer_kyc_rejected',
      targetEntityId: lawyerId,
      targetEntityType: 'lawyer',
      metadata: { rejectionReason: reason.trim() },
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reject lawyer',
    };
  }
}

/**
 * Marks lawyer application as 'under_review'
 */
export async function markLawyerUnderReview(
  adminUid: string,
  lawyerId: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  try {
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, lawyerId);
    await setDoc(lawyerRef, { kycStatus: 'under_review', updatedAt: now }, { merge: true });

    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: adminUid,
      actorRole: 'admin',
      action: 'lawyer_kyc_under_review',
      targetEntityId: lawyerId,
      targetEntityType: 'lawyer',
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update status',
    };
  }
}

/**
 * Suspends/blocks a lawyer profile
 */
export async function suspendLawyer(
  adminUid: string,
  lawyerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  try {
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, lawyerId);
    await setDoc(
      lawyerRef,
      {
        kycStatus: 'suspended',
        isAcceptingBookings: false,
        updatedAt: now,
      },
      { merge: true }
    );

    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: adminUid,
      actorRole: 'admin',
      action: 'lawyer_kyc_suspended',
      targetEntityId: lawyerId,
      targetEntityType: 'lawyer',
      metadata: { suspensionReason: reason },
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to suspend lawyer',
    };
  }
}

/**
 * Restores a suspended lawyer profile
 */
export async function restoreLawyer(
  adminUid: string,
  lawyerId: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  try {
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, lawyerId);
    await setDoc(
      lawyerRef,
      {
        kycStatus: 'verified',
        isAcceptingBookings: true,
        updatedAt: now,
      },
      { merge: true }
    );

    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: adminUid,
      actorRole: 'admin',
      action: 'lawyer_kyc_restored',
      targetEntityId: lawyerId,
      targetEntityType: 'lawyer',
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to restore lawyer',
    };
  }
}
