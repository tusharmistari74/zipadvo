import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { COLLECTIONS } from '../firebase/collections';
import type {
  LawyerProfile,
  LawyerKYCStatus,
  LawyerKYCSubmission,
  LawyerOnboardingDraft,
  AuditLog,
} from '@legalhub/types';
import {
  lawyerOnboardingSchema,
  MAX_KYC_FILE_SIZE_BYTES,
  ALLOWED_KYC_MIME_TYPES,
  type LawyerOnboardingInput,
} from '@legalhub/validation';

export interface LawyerKycStatusSummary {
  uid: string;
  status: LawyerKYCStatus;
  draftData?: LawyerOnboardingDraft;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  profile?: Partial<LawyerProfile>;
}

/**
 * Valid state transition rules for lawyer KYC lifecycle
 */
export const KYC_STATE_TRANSITIONS: Record<LawyerKYCStatus, LawyerKYCStatus[]> = {
  unverified: ['draft', 'submitted'],
  draft: ['submitted'],
  submitted: ['under_review', 'verified', 'rejected'],
  under_review: ['verified', 'rejected'],
  verified: ['suspended'],
  rejected: ['draft', 'submitted'],
  suspended: ['under_review', 'verified'],
};

export function canTransitionKycStatus(
  current: LawyerKYCStatus,
  target: LawyerKYCStatus
): boolean {
  if (current === target) return true;
  const allowed = KYC_STATE_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Validates file size and MIME type for private KYC uploads
 */
export function validateKycFile(file: { size: number; type: string; name: string }): {
  valid: boolean;
  error?: string;
} {
  if (file.size > MAX_KYC_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of 5MB. Selected file: ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
    };
  }

  if (!ALLOWED_KYC_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only PDF, JPG, PNG, and WEBP documents are permitted.',
    };
  }

  return { valid: true };
}

/**
 * Returns a standardized private storage path for a KYC document
 */
export function getPrivateKycStoragePath(
  uid: string,
  docType: 'pan' | 'aadhaar' | 'sanad' | 'office_proof' | 'profile_photo',
  filename: string
): string {
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `lawyer_kyc/${uid}/${docType}_${Date.now()}_${sanitizedName}`;
}

/**
 * Masks sensitive ID strings (e.g. PAN -> AB****34F, Aadhaar -> **** **** 1234)
 */
export function maskSensitiveId(type: 'pan' | 'aadhaar', value: string): string {
  if (type === 'pan' && value.length === 10) {
    return `${value.slice(0, 2)}****${value.slice(6)}`;
  }
  if (type === 'aadhaar' && value.length === 4) {
    return `**** **** ${value}`;
  }
  return value;
}

/**
 * Saves or updates a lawyer's onboarding draft in Firestore
 */
export async function saveLawyerOnboardingDraft(
  uid: string,
  draft: Partial<LawyerOnboardingDraft>
): Promise<void> {
  const lawyerRef = doc(db, COLLECTIONS.LAWYERS, uid);
  const now = new Date().toISOString();

  const draftPayload = {
    ...draft,
    lastSavedAt: now,
  };

  await setDoc(
    lawyerRef,
    {
      uid,
      kycStatus: 'draft',
      draftData: draftPayload,
      updatedAt: now,
    },
    { merge: true }
  );

  // Record audit log event
  try {
    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: uid,
      actorRole: 'lawyer',
      action: 'lawyer_kyc_draft_saved',
      targetEntityId: uid,
      targetEntityType: 'lawyer',
      metadata: { currentStep: draft.currentStep || 1 },
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);
  } catch {
    // Non-fatal audit log catch
  }
}

/**
 * Retrieves the current KYC onboarding status and draft data for a lawyer
 */
export async function getLawyerKYCStatus(uid: string): Promise<LawyerKycStatusSummary> {
  try {
    const lawyerRef = doc(db, COLLECTIONS.LAWYERS, uid);
    const lawyerSnap = await getDoc(lawyerRef);

    const kycRef = doc(db, COLLECTIONS.LAWYER_KYC, uid);
    const kycSnap = await getDoc(kycRef);

    if (!lawyerSnap.exists()) {
      return {
        uid,
        status: 'draft',
      };
    }

    const lawyerData = lawyerSnap.data() as LawyerProfile & { draftData?: LawyerOnboardingDraft };
    const kycData = kycSnap.exists() ? (kycSnap.data() as LawyerKYCSubmission) : undefined;

    return {
      uid,
      status: lawyerData.kycStatus || 'draft',
      draftData: lawyerData.draftData,
      submittedAt: kycData?.submittedAt,
      verifiedAt: kycData?.verifiedAt,
      rejectionReason: kycData?.rejectionReason,
      profile: lawyerData,
    };
  } catch {
    return {
      uid,
      status: 'draft',
    };
  }
}

/**
 * Submits the full lawyer KYC onboarding application for compliance review
 */
export async function submitLawyerKYC(
  uid: string,
  onboardingData: LawyerOnboardingInput
): Promise<{ success: boolean; error?: string }> {
  // 1. Strict shared schema validation
  const validation = lawyerOnboardingSchema.safeParse(onboardingData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  }

  const {
    personalInfo,
    professionalInfo,
    specializationInfo,
    chamberAndFees,
    availability,
    kycDocuments,
  } = validation.data;

  const now = new Date().toISOString();

  try {
    // 2. Write Private KYC Submission (/lawyer_kyc/{uid})
    const kycDocRef = doc(db, COLLECTIONS.LAWYER_KYC, uid);
    const kycSubmission: LawyerKYCSubmission = {
      id: uid,
      panNumberEncrypted: kycDocuments.panNumber,
      panCardStoragePath: kycDocuments.panCardStoragePath,
      aadhaarLastFour: kycDocuments.aadhaarLastFour,
      aadhaarProofStoragePath: kycDocuments.aadhaarProofStoragePath,
      sanadNumber: professionalInfo.sanadNumber,
      sanadCertificateStoragePath: kycDocuments.sanadCertificateStoragePath,
      officeProofStoragePath: kycDocuments.officeProofStoragePath || undefined,
      submittedAt: now,
    };
    await setDoc(kycDocRef, kycSubmission, { merge: true });

    // 3. Update Public Profile (/lawyers/{uid}) to 'submitted'
    const lawyerDocRef = doc(db, COLLECTIONS.LAWYERS, uid);
    const publicProfileUpdate: Partial<LawyerProfile> = {
      uid,
      fullName: personalInfo.fullName,
      title: specializationInfo.title,
      bio: specializationInfo.bio,
      avatarUrl: personalInfo.avatarUrl || undefined,
      practiceAreas: specializationInfo.practiceAreas,
      primaryCourt: professionalInfo.primaryCourt,
      yearsOfExperience: specializationInfo.yearsOfExperience,
      spokenLanguages: specializationInfo.spokenLanguages,
      officeAddress: chamberAndFees.officeAddress,
      barCouncil: {
        sanadNumber: professionalInfo.sanadNumber,
        enrollmentYear: professionalInfo.enrollmentYear,
        stateBarCouncil: professionalInfo.stateBarCouncil,
        sanadCertificateStoragePath: kycDocuments.sanadCertificateStoragePath,
      },
      kycStatus: 'submitted',
      isAcceptingBookings: chamberAndFees.isAcceptingBookings,
      consultationFeeInr: chamberAndFees.consultationFeeInr,
      availabilitySchedule: availability.availabilitySchedule,
      updatedAt: now,
    };

    await setDoc(
      lawyerDocRef,
      {
        ...publicProfileUpdate,
        createdAt: now,
      },
      { merge: true }
    );

    // 4. Log Audit Event
    const auditRef = collection(db, COLLECTIONS.AUDIT_LOGS);
    await addDoc(auditRef, {
      actorUid: uid,
      actorRole: 'lawyer',
      action: 'lawyer_kyc_submitted',
      targetEntityId: uid,
      targetEntityType: 'lawyer',
      metadata: {
        sanadNumber: professionalInfo.sanadNumber,
        practiceAreas: specializationInfo.practiceAreas,
      },
      createdAt: now,
      updatedAt: now,
    } as unknown as AuditLog);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to submit KYC onboarding',
    };
  }
}
